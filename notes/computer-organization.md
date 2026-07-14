# 1-Cycle Stealing Mode

In cycle stealing mode we always follow pipelining concept that when one byte is getting transferred then Device is parallel preparing the next byte.

"The fraction of CPU time to the data transfer time" if asked then cycle stealing mode is used.

Where,

X μsec = data transfer time or preparation time (words/block)

Y μsec = memory cycle time or transfer time (words/block)

% CPU idle (Blocked) ={ Y/X }*100

% CPU busy ={ X/Y }*100

# 2-Burst Mode

X μsec = Data transfer time

Y μsec = Memory cycle time

% CPU idle ={Y/(X+Y)}×100

% CPU busy ={X/(X+Y)}×100


# 3-Set Associative Visualization.

![Set-Associative](setasso.jpg)

# 4-Microprogrammed Control Unit Concept

## 1. Software-Driven Control

**Software-Driven Control:** Unlike hardware control units that rely on hardware circuits, a microprogrammed control unit generates control signals through software, offering greater design flexibility.

**Control Memory (ROM):** Control signals are encoded within a memory location—often a ROM—where the *i-th* bit corresponds to a specific control signal (*Ci*). Reading the memory location in a desired sequence activates the required control signals.

**Sequence of Machine States:** Standard operations during states **T0 to T2** (such as opcode fetch, instruction register decoding, and program counter increments) are stored in consecutive control memory locations starting from address zero.

---

## 2. Architecture and Components

### Microprogram Sequencer

Consists of components like the **Control Memory Address Register (CMAR)**, **Multiplexer**, and **Output Register**, which work together to determine the next memory location to be read.

### Next-Address Fields

Every location in the control memory includes:

- Control Field (Control Signals)
- Branch Address (BA)
- 1-bit Mode (**M**) Field

### Address Selection Mechanism

- **When M = 1**
  - The next address is retrieved from the internal Branch Address field.

- **When M = 0**
  - The next address is loaded from an external address generator after decoding the instruction opcode.

---

## 3. Execution of Microprograms

### Microinstructions

An individual assembly language instruction is executed by a specific microprogram consisting of one or more microinstructions.

### Single-Step Example (MOV)

A simple **MOV R1, R2** instruction requires only a single microinstruction during state **T3** to activate the specific control signals.

### Multi-Step Example (ADD)

An **ADD R1** instruction requires a microprogram of two microinstructions:

1. Load the Data Register during **T3**
2. Update the Accumulator through the ALU during **T4**

---

## 4. Trade-Offs of Microprogramming

### Advantages

- High flexibility because changing the control signal sequence only requires updating the control memory rather than altering hardware.
- Much more compact design.

### Disadvantages

- Slower than a hardware control unit because generating control signals requires fetching and reading from memory.

---

## 5. Microinstruction Design and Optimization

### Horizontal Microprogramming

Every bit in a memory location is assigned directly to a specific control signal.

- Very simple.
- Requires very wide control memory if hundreds of control signals exist.

### Encoded Control Signals

To reduce memory size, control signals can be encoded, requiring:

```
⌈log₂ n⌉ bits
```

However,

- Requires an external decoder circuit.
- Only one control signal can be activated at a time.

### Maximal Compatibility Classes (MCC)

A design optimization technique used to group compatible control signals together into classes to find a minimal cover.

### Minimal Cover and Essential Classes

The objective is to eliminate non-essential maximal compatibility classes while retaining only the **essential compatibility classes**, ensuring all control signals are represented using minimum memory.

---

## Analytical Calculations & Numerical Breakdowns

## I. Control Memory Configuration and Capacity

### Objective

Determine the total size or specific fields of a control memory based on hardware requirements.

### Example Problem

A system requires **13 distinct control signals (C₀ to C₁₂).**

The control memory stores **512 locations.**

Each location contains:

- Mode Bit (M)
- Branch Address (BA)
- Control Signals

### Calculation for BA Field

Since there are **512 locations**

```
BA = log₂(512)

= 9 bits
```

### Calculation for Total Width

Using Horizontal Microprogramming:

```
Total Width

= 1 (Mode)
+ 9 (Branch Address)
+ 13 (Control Signals)

= 23 bits per location
```

---

## II. Encoded vs Horizontal Microinstruction Design

### Objective

Compare memory requirements for Horizontal and Encoded Control.

### Example Problem

A CPU has

```
n = 64 control signals
```

### Horizontal Design

Every signal gets one bit.

```
Control Field = 64 bits
```

### Fully Encoded Design

```
⌈log₂64⌉

= 6 bits
```

### Constraint

Although encoded control is much smaller, only one control signal can be activated at a time because it uses a single decoder.

---

## III. Microprogram Sequencing and Address Generation

### Objective

Trace the addresses stored in the **Control Memory Address Register (CMAR).**

### Given

```
T0 → Address 00

T1 → Address 01

T2 → Address 02
```

At **T2**, the instruction **MOV R1, R2** is decoded.

The external address generator provides address **L**.

### Solution

```
T0

BA = 01

M = 1
(Sequential)

------------------------

T1

BA = 02

M = 1
(Sequential)

------------------------

T2

BA = XX

M = 0
(Jump to external address L)

------------------------

Address L (T3)

BA = 00

M = 1

(Return to Fetch Cycle)
```

---

## IV. Minimal Cover and Compatibility Classes

### Objective

Optimize control memory width by grouping signals that are never activated simultaneously.

### Example Problem

```
I₁ = {a, b, c, g}

I₂ = {a, c, e, h}
```

### Analysis

- **b** and **e** are compatible because they never occur together.

- **a** and **b** are incompatible because they appear together in **I₁**.

### Goal

Group compatible signals into **Maximal Compatibility Classes (MCC)** to minimize the number of bits required in the control field using a **Cover Table**.

---

---
**Source:** [NPTEL Lecture Notes](https://drive.google.com/file/d/1sl5y6o1bLdunXvaGqwnRYvsU2jJFtv2r/view)

 
# 5-Runtime Environments

Runtime environments define how a program is executed, how memory is organized, and how functions, variables, and parameters are managed during execution. These concepts are frequently tested in **GATE Computer Science**, especially in compiler design.

---

## 1. Data Representation & Memory Alignment

In a runtime environment, variables are stored in memory according to the size of their data type.

## Primitive Data Types

Typical storage sizes are:

| Data Type | Typical Size |
|-----------|-------------|
| Character | 1–2 Bytes |
| Integer | 2, 4, or 8 Bytes |
| Float | 4–16 Bytes |
| Pointer (32-bit) | 4 Bytes |
| Pointer (64-bit) | 8 Bytes |

### Pointer Representation

Pointers are stored as unsigned integers representing memory addresses.

- **32-bit architecture:** 4-byte pointer → Address space = **4 GB**
- **64-bit architecture:** 8-byte pointer

---

## Structure Padding & Memory Alignment

Compilers insert **padding bytes** to ensure that data members begin at properly aligned memory addresses.

### Example

```c
struct example {
    int num;      // 4 bytes
    char ch;      // 1 byte
    double dbl;   // 8 bytes
};
```

### Without Alignment

Total Size

\[
4 + 1 + 8 = 13 \text{ bytes}
\]

### With Standard Alignment

| Member | Offset |
|---------|--------|
| num | 0–3 |
| ch | 4 |
| Padding | 5–7 |
| dbl | 8–15 |

Since `double` must start at an address divisible by **8**, **3 bytes of padding** are inserted.

**Total Structure Size = 16 Bytes**

> **GATE Point:** Always consider compiler alignment while calculating structure size.

---

## 2. Multi-Dimensional Array Address Calculation

Compilers convert multi-dimensional arrays into linear memory.

There are two common implementations:

- Contiguous (True Multi-Dimensional Array)
- Array of Arrays

# 3. Storage Classes & Memory Segments

An executing program is divided into several runtime memory segments.

| Segment | Storage Class | Lifetime | Scope |
|----------|--------------|----------|-------|
| Code | Instructions | Entire Program | Global |
| Static/Data | Global & Static Variables | Entire Program | Global / Function |
| Stack | Local Variables & Parameters | Function Call | Block / Function |
| Heap | Dynamic Memory (`malloc`, `new`) | Until Freed / Garbage Collected | Pointer Accessible |

---

## Important GATE Note

Older versions of **Fortran** allocated local variables statically instead of using a stack.

Advantages

- Faster execution

Disadvantage

- Recursion was impossible because every recursive call reused the same memory.

---

## 4. Runtime Stack & Activation Records

Each function call creates an **Activation Record (Stack Frame)**.

---

## Contents of an Activation Record

### 1. Parameters

Arguments passed by the caller.

---

### 2. Return Address

Address of the next instruction after the function call.

---

### 3. Dynamic Link (Frame Pointer)

Points to the caller's stack frame.

Used to restore the previous frame after returning.

---

### 4. Static Link

Used in languages supporting nested procedures (like Pascal).

Points to the lexically enclosing function.

---

### 5. Local Variables & Temporaries

Stores variables declared inside the function.

---

## Calling Sequence

```text
Caller
│
├── Save Registers
├── Push Arguments
├── Set Static Link
├── Push Return Address
└── Jump to Callee
             │
             ▼
Callee
│
├── Save Registers
├── Create Frame Pointer
├── Allocate Local Variables
├── Execute Function Body
├── Restore Frame
├── Restore Registers
└── Return
             │
             ▼
Caller
│
├── Remove Arguments
├── Restore Registers
└── Continue Execution
```

---

# 5. Parameter Passing Mechanisms

| Mechanism | Description | GATE Implication |
|-----------|-------------|------------------|
| Pass by Value | Copy of argument is passed | Changes do not affect caller |
| Pass by Reference | Address of variable is passed | Changes affect caller |
| Pass by Value-Result | Copy-In Copy-Out | Copy-out order may matter |
| Pass by Name | Expression substituted textually | Expression evaluated repeatedly |

---

## Pass by Value

- Copy of argument is created.
- Original variable remains unchanged.

Used in **C**.

---

## Pass by Reference

Instead of copying,

the address of the original variable is passed.

Advantages

- Efficient for large structures
- Caller variable can be modified directly

---

## Pass by Value-Result

Also called **Copy-In Copy-Out**.

Execution:

1. Copy argument into local variable.
2. Execute function.
3. Copy final local value back to caller.

Unlike reference passing, updates occur **only when the function returns**.

---

## Pass by Name

Arguments behave like macro substitutions.

Every use of the parameter re-evaluates the original expression.

---

## Diagnostic Example

```c
int x = 1;

void foo(int a)
{
    x = 2;
    a = 3;
}

foo(x);
```

### Pass by Reference

- `a` refers to `x`
- `x = 2`
- `a = 3` updates `x`

Final

\[
\boxed{x=3}
\]

---

### Pass by Value-Result

Initially

\[
a=1
\]

Execution

- `x=2`
- `a=3`

After function returns

- Copy back

Final

\[
\boxed{x=3}
\]

---

## Collision Example

```c
int x = 1;

void bar(int a, int b)
{
    a = 5;
    b = 10;
}

bar(x, x);
```

---

## Pass by Reference

Both parameters refer to the same variable.

Execution

```
x = 5
x = 10
```

Final

\[
\boxed{x=10}
\]

---

## Pass by Value-Result

Initially

```
a = 1
b = 1
```

After execution

```
a = 5
b = 10
```

During copy-out,

- If `a` copies first then `b`

Final

\[
\boxed{x=10}
\]

- If `b` copies first then `a`

Final

\[
\boxed{x=5}
\]

# 6-Computer Architecture Performance

## 1. Core Performance Metrics & Equations

The foundation of processor performance is the **CPU Performance Equation**.

### CPU Performance Equation

**CPU Time = Instruction Count (IC) × CPI × Clock Cycle Time (Tc)**

or

**CPU Time = (Instruction Count (IC) × CPI) ÷ Clock Frequency (f)**

where

**Clock Frequency (f) = 1 ÷ Clock Cycle Time (Tc)**

### Definitions

- **Instruction Count (IC):** Total number of instructions executed by a program.
- **CPI (Cycles Per Instruction):** Average number of clock cycles required to execute one instruction.
- **Clock Cycle Time (Tc):** Time taken by one clock cycle. It depends on the processor's critical path.

### Key Performance Metrics

#### MIPS (Million Instructions Per Second)

**MIPS = Clock Rate ÷ (CPI × 10⁶)**

or

**MIPS = Instruction Count ÷ (Execution Time × 10⁶)**

#### IPC (Instructions Per Cycle)

**IPC = 1 ÷ CPI**

---

## 2. Calculating Average CPI

When different instruction types require different numbers of clock cycles, the average CPI is calculated using the instruction mix.

### Formula

**Average CPI = Σ(CPIᵢ × Frequencyᵢ)**

where:

- **CPIᵢ** = CPI of instruction type *i*
- **Frequencyᵢ** = Fraction of instruction type *i*

### 📝 Numerical Example

Suppose a program contains:

- **25% Load/Store** instructions (CPI = 3)
- **60% Arithmetic** instructions (CPI = 2)
- **15% Branch** instructions (CPI = 1)

Calculation:

**Average CPI = (0.25 × 3) + (0.60 × 2) + (0.15 × 1)**

**Average CPI = 0.75 + 1.20 + 0.15 = 2.1 cycles/instruction**

If the processor executes **400,000 instructions** at **30 MHz**:

**MIPS = 30 ÷ 2.1 ≈ 14.28 MIPS**

**CPU Time = 400,000 × 2.1 × 33 ns ≈ 27.7 ms**

---

## 3. Amdahl's Law (Speedup Limits)

Amdahl's Law determines the maximum performance improvement obtained by optimizing only one part of a system.

### Formula

**New Execution Time = Unaffected Time + (Affected Time ÷ Local Speedup)**

or

**Overall Speedup = 1 ÷ [(1 − Enhanced Fraction) + (Enhanced Fraction ÷ Local Speedup)]**

### 📝 Numerical Example

Current Average CPI = **2.1**

Target performance = **2× faster**

Therefore,

**Target CPI = 2.1 ÷ 2 = 1.05**

Weighted equation:

**1.05 = (0.25 × 3) + (0.60 × X) + (0.15 × 1)**

**1.05 = 0.75 + 0.60X + 0.15**

**1.05 = 0.90 + 0.60X**

**0.15 = 0.60X**

**X = 0.25**

> **GATE Insight:** To achieve a 2× speedup, the arithmetic CPI must decrease from **2** to **0.25**. If the required CPI becomes impossible (negative or unrealistically small), the target performance cannot be achieved by optimizing only that instruction type.

---

## 4. Single-Cycle vs. Multi-Cycle Datapaths

| Feature | Single-Cycle Datapath | Multi-Cycle Datapath |
|---------|-----------------------|----------------------|
| CPI | Always 1 | Depends on instruction |
| Clock Cycle Time | Determined by the slowest instruction | Determined by the longest execution step |
| Hardware Reuse | Not possible | Functional units are reused |
| Clock Frequency | Lower | Higher |

### 📝 Example

Instruction delays:

- Branch = **33 ns**
- Arithmetic = **50 ns**
- Load/Store = **100 ns**

**Single-Cycle Processor**

- Clock Period = **100 ns**
- Clock Frequency = **10 MHz**
- Every instruction takes **100 ns**

**Multi-Cycle Processor**

- Clock Period = **33 ns**
- Branch = **1 cycle = 33 ns**
- Arithmetic = **2 cycles = 66 ns**
- Load/Store = **3 cycles = 99 ns**

---

## 5. Latency vs. Throughput

### Latency

Time required to complete one task.

### Throughput

Number of tasks completed per unit time.

> **GATE Tip:** Increasing clock frequency alone does **not** always improve performance. If CPI also increases, the overall execution time may remain unchanged or even become worse.

---

## Source

Cornell University – Computer Architecture Performance Notes

https://www.cs.cornell.edu/courses/cs3410/2019sp/schedule/slides/08-performance-notes.pdf


