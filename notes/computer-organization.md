# Cycle Stealing Mode

In cycle stealing mode we always follow pipelining concept that when one byte is getting transferred then Device is parallel preparing the next byte.

"The fraction of CPU time to the data transfer time" if asked then cycle stealing mode is used.

Where,

X μsec = data transfer time or preparation time (words/block)

Y μsec = memory cycle time or transfer time (words/block)

% CPU idle (Blocked) ={ Y/X }*100

% CPU busy ={ X/Y }*100

# Burst Mode

X μsec = Data transfer time

Y μsec = Memory cycle time

% CPU idle ={Y/(X+Y)}×100

% CPU busy ={X/(X+Y)}×100


# Set Associative Visualization.

![Set-Associative](setasso.jpg)

# Microprogrammed Control Unit Concept

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

# Analytical Calculations & Numerical Breakdowns

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
