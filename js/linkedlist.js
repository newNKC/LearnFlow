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
    if (!node || !node.prev) return false; // อยู่บนสุดแล้ว หรือไม่มี

    const prevNode = this.nodes.get(node.prev);
    if (!prevNode) return false;

    const prevPrevNode = prevNode.prev ? this.nodes.get(prevNode.prev) : null;
    const nextNode = node.next ? this.nodes.get(node.next) : null;


    if (prevPrevNode) {
      prevPrevNode.next = id;
    } else {
      this.head = id; // ขึ้นไปเป็น head ใหม่
    }

    if (nextNode) {
      nextNode.prev = prevNode.id;
    } else {
      this.tail = prevNode.id; // ถ้า node อยู่ตัวสุดท้าย prevNode จะกลายเป็น tail
    }

    // สลับ pointers ระหว่าง 2 nodes
    node.prev = prevNode.prev;
    node.next = prevNode.id;

    prevNode.prev = id;
    prevNode.next = nextNode ? nextNode.id : null;

    return true;
  }

  // Move node down (swap with next) 
  moveDown(id) {
    const node = this.nodes.get(id);
    if (!node || !node.next) return false; // อยู่ล่างสุดแล้ว หรือไม่มี

    // การเลื่อนลง = เอา next node ขึ้นมาแทน (เรียก moveUp ของ next)
    return this.moveUp(node.next);
  }


  // Update node content
  update(id, data) {
    const node = this.nodes.get(id);
    if (!node) return false;
    if (data.title !== undefined) node.title = data.title;
    if (data.content !== undefined) node.content = data.content;
    return true;
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
