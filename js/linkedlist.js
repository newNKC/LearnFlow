// ===== LINKEDLIST.JS — Linked List Data Structure =====
// Used to manage lessons within courses

class LessonNode {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.next = data.next || null;  // ID of next lesson
    this.prev = data.prev || null;  // ID of prev lesson
  }
}

class LessonLinkedList {
  constructor() {
    this.nodes = new Map(); // id -> LessonNode
    this.head = null; // first lesson id
    this.tail = null; // last lesson id
    this.size = 0;
  }

  // Build linked list from flat array (from DB)
  fromArray(arr) {
    this.nodes.clear();
    this.head = null;
    this.tail = null;
    this.size = 0;
    if (!arr || arr.length === 0) return this;

    // Create nodes
    arr.forEach(item => {
      this.nodes.set(item.id, new LessonNode(item));
    });

    // Find head (no prev)
    let headNode = arr.find(n => !n.prev);
    if (!headNode) headNode = arr[0]; // fallback
    this.head = headNode.id;

    // Find tail (no next)
    let tailNode = arr.find(n => !n.next);
    if (!tailNode) tailNode = arr[arr.length - 1];
    this.tail = tailNode.id;

    this.size = arr.length;
    return this;
  }

  // Convert back to array (in order) for storage
  toArray() {
    const result = [];
    let current = this.head;
    const visited = new Set();
    while (current && !visited.has(current)) {
      visited.add(current);
      const node = this.nodes.get(current);
      if (!node) break;
      result.push({ id: node.id, title: node.title, content: node.content, next: node.next, prev: node.prev });
      current = node.next;
    }
    return result;
  }

  // Get node by id
  get(id) {
    return this.nodes.get(id) || null;
  }

  // Get ordered array of nodes
  getOrdered() {
    const result = [];
    let current = this.head;
    const visited = new Set();
    while (current && !visited.has(current)) {
      visited.add(current);
      const node = this.nodes.get(current);
      if (!node) break;
      result.push(node);
      current = node.next;
    }
    return result;
  }

  // Append node to end
  append(data) {
    const node = new LessonNode({
      id: data.id || `l_${Date.now()}`,
      title: data.title,
      content: data.content,
      next: null,
      prev: this.tail
    });
    this.nodes.set(node.id, node);

    if (this.tail) {
      const tailNode = this.nodes.get(this.tail);
      if (tailNode) tailNode.next = node.id;
    } else {
      this.head = node.id;
    }
    this.tail = node.id;
    this.size++;
    return node;
  }

  // Insert after a given id
  insertAfter(afterId, data) {
    const afterNode = this.nodes.get(afterId);
    if (!afterNode) return this.append(data);

    const node = new LessonNode({
      id: data.id || `l_${Date.now()}`,
      title: data.title,
      content: data.content,
      next: afterNode.next,
      prev: afterId
    });
    this.nodes.set(node.id, node);

    if (afterNode.next) {
      const nextNode = this.nodes.get(afterNode.next);
      if (nextNode) nextNode.prev = node.id;
    } else {
      this.tail = node.id;
    }
    afterNode.next = node.id;
    this.size++;
    return node;
  }

  // Remove node by id
  remove(id) {
    const node = this.nodes.get(id);
    if (!node) return false;

    if (node.prev) {
      const prevNode = this.nodes.get(node.prev);
      if (prevNode) prevNode.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      const nextNode = this.nodes.get(node.next);
      if (nextNode) nextNode.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.nodes.delete(id);
    this.size--;
    return true;
  }

  // Move node up (swap with prev)
  moveUp(id) {
    const node = this.nodes.get(id);
    if (!node || !node.prev) return false;
    const prevNode = this.nodes.get(node.prev);
    this._swapNodes(prevNode.id, node.id);
    return true;
  }

  // Move node down (swap with next)
  moveDown(id) {
    const node = this.nodes.get(id);
    if (!node || !node.next) return false;
    const nextNode = this.nodes.get(node.next);
    this._swapNodes(node.id, nextNode.id);
    return true;
  }

  _swapNodes(aId, bId) {
    const a = this.nodes.get(aId);
    const b = this.nodes.get(bId);
    if (!a || !b) return;

    // Swap titles and content only (keep structural links intact then rebuild)
    const tmpTitle = a.title; a.title = b.title; b.title = tmpTitle;
    const tmpContent = a.content; a.content = b.content; b.content = tmpContent;
    const tmpId = a.id; a.id = b.id; b.id = tmpId;

    // Re-map
    this.nodes.delete(aId);
    this.nodes.delete(bId);
    this.nodes.set(a.id, a);
    this.nodes.set(b.id, b);
  }

  // Update node content
  update(id, data) {
    const node = this.nodes.get(id);
    if (!node) return false;
    if (data.title !== undefined) node.title = data.title;
    if (data.content !== undefined) node.content = data.content;
    return true;
  }

  // Get index of node (0-based)
  indexOf(id) {
    let idx = 0;
    let current = this.head;
    while (current) {
      if (current === id) return idx;
      const node = this.nodes.get(current);
      if (!node) break;
      current = node.next;
      idx++;
    }
    return -1;
  }

  // Get next node
  getNext(id) {
    const node = this.nodes.get(id);
    if (!node || !node.next) return null;
    return this.nodes.get(node.next) || null;
  }

  // Get prev node
  getPrev(id) {
    const node = this.nodes.get(id);
    if (!node || !node.prev) return null;
    return this.nodes.get(node.prev) || null;
  }
}

// Global instance factory
function createLinkedList(arr) {
  const ll = new LessonLinkedList();
  ll.fromArray(arr || []);
  return ll;
}