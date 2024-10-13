---
title: Leetcode 刷题记录之链表
date: 2019-10-16 21:27:24
mathjax: true
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/leecode.png
tags: 
- 数据结构与算法
- 链表
categories: 
- 学习笔记
---

## [237. 删除链表中的节点](https://leetcode-cn.com/problems/delete-node-in-a-linked-list/)

请编写一个函数，使其可以删除某个链表中给定的（非末尾）节点。传入函数的唯一参数为 **要被删除的节点** 。

示例 ：


> 输入：head = [4,5,1,9], node = 5
> 输出：[4,1,9]
> 解释：给定你链表中值为 5 的第二个节点，那么在调用了你的函数之后，该链表应变为 4 -> 1 -> 9.

**提示：**

- 链表至少包含两个节点。
- 链表中所有节点的值都是唯一的。
- 给定的节点为非末尾节点并且一定是链表中的一个有效节点。
- 不要从你的函数中返回任何结果。

**思路**：

这个题目比较反常，相对于我们常规的删除链表中的节点，因为一般在链表中删除一个节点，操作基本是：

1. 修改要删除节点的上一个节点的指针
2. 将该指针指向要删除节点的下一个节点

这道题只知道需要删除的节点，正因如此，题解才会如此巧妙。

我们可以将待删除节点的下一个节点覆盖掉待删除节点，以下是代码：

```java
public void deleteNode(ListNode node) {
    node.val = node.next.val;		// 将下一个节点的值覆盖带删除节点
    node.next = node.next.next;		// 将待删除节点指向下下一个节点
}
```

评论区很有意思：

> [SorXDL1](https://leetcode-cn.com/u/wcfairytale/)：
>
> 这道题细思极恐：如何让自己在世界上消失，但又不死？ —— 将自己完全变成另一个人，再杀了那个人就行了。

## [206. 反转链表](https://leetcode-cn.com/problems/reverse-linked-list/)

反转一个单链表。

示例:

> 输入: 1->2->3->4->5->NULL
> 输出: 5->4->3->2->1->NULL

**进阶**:
你可以迭代或递归地反转链表。你能否用两种方法解决这道题？

### 递归方法

**思路**：

递归的思维诀窍：**在用递归思想解题时，明确递推公式的含义后，不要试图想明白每一步是如何递归的，这很容易把自己绕晕。**

例如，这道题，给出的解法方法也就是递推公式，是`reverseList()`，我们需要明白这个方法的作用是什么：**根据头结点把拿到的链表进行反转，然后返回新的头结点**。

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210424111352.png)

```java
public ListNode reverseList(ListNode head) {
    // 调用递推公式反转当前结点之后的所有节点
    // 返回的结果是反转后的链表的头结点
    ListNode newHead = reverseList(head.next);
}
```

接着要做的就是反转结点 1 ，也就是将head指向的结点作为其下一个结点的下一个结点，此时节点1 和反转之后的节点 2 仍然是相连的，即`head.next.next=head`。

最后，将 head 指向的结点的下一个结点置为 null，就完成了整个链表的反转。

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210424112113.png)

递推公式完成之后，还有重要的一步就是递归终止条件：在 head 指向的结点为 null 或 head 指向的结点的下一个结点为 null 时停止，反转后也就是 head 本身。完整代码如下：

```java
public ListNode reverseList(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }
    ListNode newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}
```

**感想**：

之前在学习C语言的时候，也是接触到递归的，当时是老想着把整个递归过程自己去用笔纸去推导一遍，验证；如今再次接触到递归，看了他人的分析与总结，我才感觉真正学会了一点递归的思想，受益匪浅，递归需要的是明确递推公式的含义，可以这么说吧，把整个解决步骤当作最后一步处理，并处理好递归结束条件即可。

### 迭代方法

**思路**：

迭代的方法也就是一个一个来，以下的方法像是把一个链表一节一节扒开，再组合，重新组合的链表便是反转后的了，具体步骤：

+ 创建一个 `newHead `节点；
+ 进入循环，创建一个临时节点`temp `指向`head `节点的 `next `节点；
+ 之后将`head `节点的 **next** 指向 **null**；
+ 接着将`newHead `节点指向当前的`head `节点；
+ 最后将`head `节点指向临时节点`temp `，这样完成第一轮循环；

同样的，我们要做好这个循环结束的判断，当`head `节点的 **next** 为 **null** 时说明已经循环整个链表，代码如下：

```java
public ListNode reverseList(ListNode head) {
    ListNode newHead = null;

    while (head != null) {
        ListNode temp = head.next;
        head.next = newHead;
        newHead = head;
        head = temp;
    }
    return newHead;
}
```

##  [141. 环形链表](https://leetcode-cn.com/problems/linked-list-cycle/)

给定一个链表，判断链表中是否有环。

如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 为了表示给定链表中的环，我们使用整数 **pos** 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 **pos** 是 -1，则在该链表中没有环。注意：**pos** 不作为参数进行传递，仅仅是为了标识链表的实际情况。

如果链表中存在环，则返回 true 。 否则，返回 false 。

**示例**：

> 输入：head = [3,2,0,-4], pos = 1
> 输出：true
> 解释：链表中有一个环，其尾部连接到第二个节点。

**提示：**

- 链表中节点的数目范围是 `[0, 104]`
- `-105 <= Node.val <= 105`
- `pos` 为 `-1` 或者链表中的一个 **有效索引** 。

**进阶**：

你能用 O(1)（即，常量）内存解决此问题吗？

**思路**：

当一个链表存在环的时候，经典的作法是使用快慢指针，别问我怎么就知道快慢指针，这是一种数据结构与算法的知识储备；快慢指针，通俗一点可以描述为九年义务教育中的**追及问题**，如一个环形操场上跑步，有甲乙二人，一慢一快，无论在哪起跑，总会相遇的。

而转到链表，我们设定慢指针每次只移动一步，而快指针每次移动两步，当两个指针都进入环后，初始时，慢指针在位置 `head`，而快指针在位置 `head.next`。如果链表存在环，那么快指针总会追上慢指针。

```java
public boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) {
        return false;
    }
    ListNode slow = head;
    ListNode quick = head.next;
    while (quick != null && quick.next != null) {
        if (slow == quick) {
            return true;
        }
        slow = slow.next;
        quick = quick.next.next;
    }
    return false;
}
```

感想：

算法题也是像应试题目的，需要知识理论基础，并加之以不断的练习，这个练习就是普通人的大脑发挥作用的地方了，不断的总结归纳吧。就拿这个题目来讲，我最初想到的解法是把每一个节点都存到数组中，然后循环检查，快慢指针这个概念脑袋中是没有的，所以以后遇到这类题的变种，至少脑子里会有快慢指针这个概念了。

在评论区也看到了一个举一反三的想法，要是存在环，**如何判断环的长度呢**？方法是，快慢指针相遇后继续移动，直到第二次相遇。两次相遇间的**移动次数即为环的长度**。

