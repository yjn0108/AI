import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const questionBank: Record<string, Question[]> = {
  data_structures: [
    {
      question: "以下关于栈（Stack）的描述，错误的是：",
      options: ["栈是先进后出的数据结构", "栈可以用数组或链表实现", "栈顶指针指向栈顶元素", "栈的插入和删除操作都在栈顶进行"],
      correct: 2,
      explanation: "栈顶指针top通常指向栈顶元素的下一个位置（即下一个可插入位置），而非栈顶元素本身，这取决于具体实现。但一般约定top指向栈顶元素。题目中选项C说'指向栈顶元素'是一种合法实现，但也有实现是指向下一位置。实际上选项C是正确的常见约定，本题考查细节理解。"
    },
    {
      question: "一棵完全二叉树有1000个节点，其叶节点的个数是：",
      options: ["499", "500", "501", "502"],
      correct: 1,
      explanation: "完全二叉树中，若总节点数n=1000，叶节点数= ⌈n/2⌉ = ⌈1000/2⌉ = 500。"
    },
    {
      question: "快速排序在最坏情况下的时间复杂度是：",
      options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
      correct: 1,
      explanation: "快速排序最坏情况发生在每次划分极度不均匀时（如已排序序列），此时递归深度为n，每层操作O(n)，总时间复杂度O(n²)。"
    },
    {
      question: "关于AVL树，以下说法正确的是：",
      options: [
        "AVL树是一种哈希表",
        "AVL树任意节点左右子树高度差不超过1",
        "AVL树的插入操作不需要旋转",
        "AVL树的查找时间复杂度为O(n)"
      ],
      correct: 1,
      explanation: "AVL树是高度平衡的二叉搜索树，任意节点的左右子树高度差（平衡因子）绝对值不超过1，查找时间复杂度O(log n)。"
    },
    {
      question: "顺序存储的线性表，插入和删除操作的时间复杂度分别是：",
      options: ["O(1) 和 O(1)", "O(n) 和 O(n)", "O(1) 和 O(n)", "O(n) 和 O(1)"],
      correct: 1,
      explanation: "顺序表插入和删除都需要移动平均n/2个元素，时间复杂度均为O(n)。"
    },
    {
      question: "下列哪种排序算法是稳定排序？",
      options: ["快速排序", "堆排序", "归并排序", "选择排序"],
      correct: 2,
      explanation: "归并排序是稳定排序，相同元素的相对顺序在排序后不变。快速排序、堆排序、选择排序均为不稳定排序。"
    },
    {
      question: "哈希表在最好情况下查找的时间复杂度为：",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      correct: 2,
      explanation: "哈希表在无冲突的理想情况下，直接通过哈希函数定位，查找时间复杂度为O(1)。"
    },
    {
      question: "图的深度优先搜索（DFS）使用的辅助数据结构是：",
      options: ["队列", "栈", "优先队列", "哈希表"],
      correct: 1,
      explanation: "DFS使用栈（或递归调用栈）来存储待访问的节点，而BFS使用队列。"
    },
    {
      question: "设循环队列的容量为N，队头指针为front，队尾指针为rear，则队满条件是：",
      options: ["(rear+1) % N == front", "rear == front", "(front+1) % N == rear", "rear - front == N"],
      correct: 0,
      explanation: "循环队列判满通常牺牲一个存储单元，队满条件为(rear+1)%N == front，以区分队空（rear == front）。"
    },
    {
      question: "n个顶点的无向完全图共有多少条边？",
      options: ["n(n-1)", "n(n+1)/2", "n(n-1)/2", "n²"],
      correct: 2,
      explanation: "无向完全图中每两个顶点之间都有一条边，共C(n,2) = n(n-1)/2条边。"
    },
    {
      question: "对n个元素进行堆排序，其时间复杂度为：",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      correct: 1,
      explanation: "堆排序建堆O(n)，n次堆调整每次O(log n)，总时间复杂度O(n log n)。"
    },
    {
      question: "单链表中，在已知节点p之后插入一个新节点q，需要的操作是：",
      options: [
        "q->next = p; p->next = q;",
        "q->next = p->next; p->next = q;",
        "p->next = q; q->next = p->next;",
        "p->next = q->next; q->next = p;"
      ],
      correct: 1,
      explanation: "正确顺序：先将q的next指向p的下一个节点，再将p的next指向q，即q->next = p->next; p->next = q;。顺序不能颠倒，否则会丢失p->next的原始值。"
    },
    {
      question: "二叉搜索树（BST）中序遍历的结果是：",
      options: ["随机序列", "从大到小排列", "从小到大排列", "层次序列"],
      correct: 2,
      explanation: "BST的中序遍历（左-根-右）结果是从小到大的有序序列，这是BST的重要性质。"
    },
    {
      question: "以下关于B树和B+树的说法，正确的是：",
      options: [
        "B树的叶节点包含所有数据",
        "B+树的非叶节点也存储数据记录",
        "B+树所有叶节点通过指针连成链表",
        "B树比B+树更适合范围查询"
      ],
      correct: 2,
      explanation: "B+树的叶节点包含所有关键字及数据，并通过指针连成有序链表，非常适合范围查询。B树的非叶节点也存储数据，B+树非叶节点只存索引。"
    },
    {
      question: "拓扑排序适用于什么样的图？",
      options: ["无向图", "有环有向图", "有向无环图（DAG）", "完全图"],
      correct: 2,
      explanation: "拓扑排序只适用于有向无环图（DAG），将所有顶点排成线性序列使得所有有向边从前指向后。"
    }
  ],
  os: [
    {
      question: "进程和线程的主要区别是：",
      options: [
        "进程是资源分配的基本单位，线程是CPU调度的基本单位",
        "线程是资源分配的基本单位，进程是CPU调度的基本单位",
        "进程和线程都是资源分配的基本单位",
        "进程和线程都是CPU调度的基本单位"
      ],
      correct: 0,
      explanation: "进程是操作系统进行资源分配（内存、文件等）的基本单位；线程是CPU调度和执行的基本单位，同一进程的线程共享进程资源。"
    },
    {
      question: "以下哪种页面置换算法理论上缺页率最低？",
      options: ["FIFO", "LRU", "OPT（最优置换）", "Clock算法"],
      correct: 2,
      explanation: "OPT（最优置换算法）每次淘汰将来最长时间不会使用的页面，理论上缺页率最低，但因需要预知未来访问序列，实际无法实现。"
    },
    {
      question: "死锁产生的四个必要条件不包括：",
      options: ["互斥条件", "占有并等待", "非抢占条件", "进程数量大于资源数量"],
      correct: 3,
      explanation: "死锁四个必要条件：互斥条件、占有并等待（保持并等待）、非抢占条件（不剥夺条件）、循环等待条件。进程数量与资源数量的关系不是必要条件。"
    },
    {
      question: "在分页存储管理中，逻辑地址转换为物理地址需要通过：",
      options: ["段表", "页表", "符号表", "目录表"],
      correct: 1,
      explanation: "分页存储管理中，通过页表将逻辑地址中的页号映射到物理内存中的帧号，再加上页内偏移得到物理地址。"
    },
    {
      question: "信号量机制中，P操作（wait）的含义是：",
      options: [
        "信号量值加1，若结果≤0则唤醒等待进程",
        "信号量值减1，若结果<0则阻塞当前进程",
        "信号量值加1，若结果>0则继续执行",
        "信号量值减1，若结果≥0则继续执行"
      ],
      correct: 1,
      explanation: "P操作（wait/down）：信号量S减1，若S<0则当前进程阻塞并加入等待队列；V操作（signal/up）：S加1，若S≤0则唤醒一个等待进程。"
    },
    {
      question: "磁盘调度算法SCAN（电梯算法）的特点是：",
      options: [
        "按请求到达顺序服务",
        "总是服务距当前磁头最近的请求",
        "磁头沿一个方向移动，服务途中请求，到端后反向",
        "磁头总从最内圈扫到最外圈再返回"
      ],
      correct: 2,
      explanation: "SCAN算法（电梯算法）：磁头沿一个方向移动，服务途中的所有请求，到达端点或无更多请求时反向移动，减少了SSTF的饥饿问题。"
    },
    {
      question: "虚拟内存技术的核心思想是：",
      options: [
        "增加物理内存容量",
        "将程序全部装入内存才能运行",
        "利用局部性原理，只将程序部分装入内存",
        "使用更快的存储介质"
      ],
      correct: 2,
      explanation: "虚拟内存基于程序的局部性原理，只将当前需要的部分装入内存，其余保存在磁盘，使程序能运行在比实际物理内存更大的地址空间中。"
    },
    {
      question: "以下关于管程（Monitor）的说法，正确的是：",
      options: [
        "管程是一种硬件同步机制",
        "管程内任意时刻可有多个进程同时执行",
        "管程将共享变量和对其操作封装在一起，保证互斥访问",
        "管程不能解决生产者-消费者问题"
      ],
      correct: 2,
      explanation: "管程是一种高级同步机制，将共享数据和对其的操作过程封装在一起，任意时刻只允许一个进程在管程内执行，由编译器保证互斥。"
    },
    {
      question: "用户态和内核态之间切换的原因不包括：",
      options: ["系统调用", "异常/中断", "进程间切换上下文", "普通函数调用"],
      correct: 3,
      explanation: "用户态切换到内核态的原因：系统调用（trap）、异常（如缺页）、硬件中断。普通函数调用在用户态内进行，不需要态转换。"
    },
    {
      question: "银行家算法用于解决：",
      options: ["死锁检测", "死锁恢复", "死锁预防", "死锁避免"],
      correct: 3,
      explanation: "银行家算法是一种死锁避免算法，通过在分配资源前检测安全状态来避免系统进入不安全状态（可能导致死锁的状态）。"
    },
    {
      question: "以下文件组织方式中，适合随机访问的是：",
      options: ["顺序文件", "索引文件", "链接文件", "堆文件"],
      correct: 1,
      explanation: "索引文件通过索引表直接定位记录位置，支持高效随机访问。顺序文件和链接文件随机访问效率低。"
    },
    {
      question: "实时操作系统（RTOS）最重要的特性是：",
      options: ["多用户支持", "高吞吐量", "时间确定性（可预测的响应时间）", "图形界面"],
      correct: 2,
      explanation: "实时操作系统最关键的特性是时间确定性，即任务能在规定的截止时间（deadline）内完成，而非追求高吞吐量。"
    }
  ],
  computer_org: [
    {
      question: "在补码表示中，8位二进制能表示的最小负整数是：",
      options: ["-127", "-128", "-256", "-255"],
      correct: 1,
      explanation: "8位补码范围：-128到+127。最小值-128的补码为10000000，这是补码特有的，原码和反码只能表示-127到+127。"
    },
    {
      question: "浮点数规格化的目的是：",
      options: ["提高存储效率", "提高运算精度和数的范围", "简化硬件设计", "加快运算速度"],
      correct: 1,
      explanation: "浮点数规格化通过保证尾数最高有效位为1（隐含位），使尾数的有效精度最高，同时充分利用指数范围，提高表示精度和范围。"
    },
    {
      question: "Cache的工作原理基于：",
      options: ["空间局部性原理", "时间局部性原理", "时间和空间局部性原理", "随机访问原理"],
      correct: 2,
      explanation: "Cache工作原理依据程序的局部性原理：时间局部性（最近访问的数据可能再次访问）和空间局部性（访问某地址后可能访问相邻地址）。"
    },
    {
      question: "指令流水线中，影响流水线效率的主要因素不包括：",
      options: ["数据相关", "控制相关", "结构相关", "寄存器数量"],
      correct: 3,
      explanation: "流水线冒险（hazard）分三类：结构冒险（资源冲突）、数据冒险（数据依赖）、控制冒险（分支跳转）。寄存器数量不是影响流水线效率的主要因素。"
    },
    {
      question: "DMA（直接内存访问）控制器的主要优点是：",
      options: [
        "提高CPU的运算速度",
        "减少CPU介入I/O操作，提高系统效率",
        "增大内存容量",
        "提高I/O设备的数据传输精度"
      ],
      correct: 1,
      explanation: "DMA允许I/O设备在不经过CPU的情况下直接与内存交换数据，大大减少了CPU参与I/O操作的时间，提高了CPU利用率和系统整体效率。"
    },
    {
      question: "RISC（精简指令集）和CISC（复杂指令集）的主要区别是：",
      options: [
        "RISC指令更长，CISC指令更短",
        "RISC指令简单统一，CISC指令复杂多变",
        "RISC不支持流水线，CISC支持流水线",
        "RISC主要用于服务器，CISC用于PC"
      ],
      correct: 1,
      explanation: "RISC：指令少而简单、定长格式、大量寄存器、Load/Store架构，便于流水线。CISC：指令多而复杂、变长格式、指令直接操作内存。现代CPU多采用RISC内核+CISC外观。"
    },
    {
      question: "在存储器层次结构中，从上到下（寄存器→Cache→主存→磁盘）的趋势是：",
      options: [
        "速度增快，容量增大，价格增高",
        "速度减慢，容量增大，价格降低",
        "速度增快，容量减小，价格降低",
        "速度减慢，容量减小，价格增高"
      ],
      correct: 1,
      explanation: "存储层次从寄存器到磁盘：速度逐渐降低，容量逐渐增大，单位存储价格逐渐降低。这是存储器层次结构设计的基本规律。"
    },
    {
      question: "中断向量的作用是：",
      options: [
        "存储中断发生次数",
        "存储中断服务程序的入口地址",
        "存储中断优先级",
        "保存中断时的CPU状态"
      ],
      correct: 1,
      explanation: "中断向量（Interrupt Vector）存储中断服务程序（ISR）的入口地址。当中断发生时，CPU通过中断号索引中断向量表找到对应ISR的入口地址，跳转执行。"
    },
    {
      question: "在定点补码运算中，溢出的判断方法是：",
      options: [
        "最高位为1表示溢出",
        "运算结果为0表示溢出",
        "符号位和进位情况不一致时溢出",
        "两个正数相加结果为负时溢出"
      ],
      correct: 2,
      explanation: "补码溢出判断：双符号位法（模4补码）中两个符号位不同时溢出；单符号位法中，符号位的进位（Cs）与最高数值位的进位（Cp）异或为1时溢出，即Cs⊕Cp=1。"
    },
    {
      question: "虚拟地址到物理地址的转换由哪个部件完成？",
      options: ["ALU", "MMU（内存管理单元）", "Cache控制器", "中断控制器"],
      correct: 1,
      explanation: "MMU（Memory Management Unit，内存管理单元）负责将CPU发出的虚拟（逻辑）地址转换为物理地址，并进行内存保护。"
    }
  ],
  networks: [
    {
      question: "OSI参考模型中，负责端到端可靠传输的层是：",
      options: ["网络层", "传输层", "会话层", "数据链路层"],
      correct: 1,
      explanation: "传输层（第4层）负责端到端的可靠数据传输，提供差错控制和流量控制。TCP协议工作在此层，提供面向连接的可靠传输。"
    },
    {
      question: "TCP三次握手的主要目的是：",
      options: [
        "加密传输数据",
        "确定传输速率",
        "建立连接并同步双方的序列号",
        "验证用户身份"
      ],
      correct: 2,
      explanation: "TCP三次握手：SYN→SYN+ACK→ACK，目的是建立可靠连接并同步双方的初始序列号（ISN），确保双方都有发送和接收能力。"
    },
    {
      question: "IP地址192.168.1.0/24中，/24表示：",
      options: ["主机号占24位", "网络号占24位", "子网内有24台主机", "IP版本号"],
      correct: 1,
      explanation: "/24（CIDR表示法）表示网络号（子网掩码）占前24位，即子网掩码为255.255.255.0，该子网可容纳254台主机（256-2，去掉网络地址和广播地址）。"
    },
    {
      question: "DNS（域名系统）的主要功能是：",
      options: [
        "分配IP地址",
        "将域名解析为IP地址",
        "加密网络通信",
        "路由数据包"
      ],
      correct: 1,
      explanation: "DNS（Domain Name System）将人类可读的域名（如www.example.com）解析为计算机可识别的IP地址，是互联网的重要基础设施。"
    },
    {
      question: "以下协议中，工作在应用层的是：",
      options: ["TCP", "IP", "Ethernet", "HTTP"],
      correct: 3,
      explanation: "HTTP（超文本传输协议）工作在应用层。TCP工作在传输层，IP工作在网络层，Ethernet（以太网协议）工作在数据链路层和物理层。"
    },
    {
      question: "滑动窗口协议中，窗口的作用是：",
      options: [
        "加密数据",
        "实现流量控制和提高信道利用率",
        "进行路由选择",
        "错误检测"
      ],
      correct: 1,
      explanation: "滑动窗口允许发送方在收到确认前连续发送多个帧，实现流量控制（接收方控制发送速率）并提高信道利用率，避免每发一帧就等待确认的低效方式。"
    },
    {
      question: "HTTPS与HTTP的主要区别是：",
      options: [
        "HTTPS使用UDP，HTTP使用TCP",
        "HTTPS传输速度更快",
        "HTTPS在HTTP基础上增加了TLS/SSL加密",
        "HTTPS只能用于内网"
      ],
      correct: 2,
      explanation: "HTTPS = HTTP + TLS/SSL，在HTTP基础上增加了传输层安全（TLS/SSL）协议，提供数据加密、身份验证和数据完整性保护，默认端口443（HTTP为80）。"
    },
    {
      question: "路由器工作在OSI模型的哪一层？",
      options: ["物理层", "数据链路层", "网络层", "传输层"],
      correct: 2,
      explanation: "路由器工作在网络层（第3层），根据IP地址进行路由选择和数据包转发。交换机工作在数据链路层，集线器工作在物理层。"
    },
    {
      question: "TCP的拥塞控制算法中，慢启动阶段拥塞窗口（cwnd）的增长规律是：",
      options: ["线性增长", "指数增长（每RTT翻倍）", "保持不变", "随机增长"],
      correct: 1,
      explanation: "TCP慢启动阶段：每收到一个ACK，cwnd增加1个MSS，每个RTT后cwnd翻倍（指数增长），直到达到慢启动阈值（ssthresh）后转为拥塞避免（线性增长）。"
    },
    {
      question: "以下关于UDP协议的说法，错误的是：",
      options: [
        "UDP是无连接协议",
        "UDP提供可靠数据传输",
        "UDP首部开销小（8字节）",
        "DNS查询使用UDP"
      ],
      correct: 1,
      explanation: "UDP（用户数据报协议）是无连接、不可靠的传输层协议，不提供确认、重传、流量控制等可靠性机制，但开销小、延迟低，适合实时应用和DNS查询。"
    },
    {
      question: "ARP协议的功能是：",
      options: [
        "将IP地址解析为域名",
        "将MAC地址解析为IP地址",
        "将IP地址解析为MAC地址",
        "将域名解析为IP地址"
      ],
      correct: 2,
      explanation: "ARP（地址解析协议）通过广播请求，将已知的IP地址（第3层）解析为对应的MAC地址（第2层），用于同一局域网内的数据帧传输。"
    }
  ]
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { subject = "data_structures", count = 5 } = await req.json().catch(() => ({}));

    const pool = questionBank[subject] ?? questionBank["data_structures"];
    const selected = shuffleArray(pool).slice(0, Math.min(count, pool.length));

    const questions = selected.map((q, idx) => {
      // Shuffle options while tracking correct answer
      const indexed = q.options.map((opt, i) => ({ opt, original: i }));
      const shuffled = shuffleArray(indexed);
      const newCorrect = shuffled.findIndex(x => x.original === q.correct);

      return {
        id: idx,
        question: q.question,
        options: shuffled.map(x => x.opt),
        correct: newCorrect,
        explanation: q.explanation,
      };
    });

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
