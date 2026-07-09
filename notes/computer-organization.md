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
Software-Driven Control: Unlike hardware control units that rely on hardware circuits, a microprogrammed control unit generates control signals through software, offering greater design flexibility.
Control Memory (ROM): Control signals are encoded within a memory location—often a ROM—where the $i^{th}$ bit corresponds to a specific control signal ($C\_i$). Reading the memory location in a desired sequence activates the required control signals.
Sequence of Machine States: Standard operations during states $T\_0$ to $T\_2$ (such as opcode fetch, instruction register decoding, and program counter increments) are stored in consecutive control memory locations starting from address zero.
2. Architecture and Components
Microprogram Sequencer: Consists of components like the Control Memory Address Register (CMAR), multiplexer, and output register, which work together to determine the next memory location to be read.
Next-Address Fields: Every location in the control memory includes a control field for signals, a branch address field for the next location, and a 1-bit mode ($M$) field.
Address Selection Mechanism:
When $M=1$, the next address is retrieved from the internal branch address field.
When $M=0$, it is loaded from an external address generator after decoding the instruction opcode.
3. Execution of Microprograms
Microinstructions: An individual assembly language instruction is executed by a specific microprogram consisting of one or more microinstructions.
Single-Step Example (MOV): A simple MOV R1, R2 instruction requires only a single microinstruction during state $T\_3$ to activate the specific control signals.
Multi-Step Example (ADD): An ADD R1 instruction requires a microprogram of two microinstructions to sequentially load the data register ($T\_3$) and then update the accumulator via the ALU ($T\_4$).
4. Trade-Offs of Microprogramming
Advantages: High flexibility because changing the control signal sequence only requires updating the control memory rather than altering hardware. It also yields a much more compact design.
 Disadvantages: It is inherently slower than a hardware control unit because generating control signals requires fetching and reading from memory.
5. Microinstruction Design and Optimization
Horizontal Microprogramming: A method where every bit in a memory location is assigned directly to a specific control signal. This results in massive memory widths if a system has hundreds of signals.
Encoded Control Signals: To reduce memory size, control signals can be encoded, requiring $\lceil\log\_2 n\rceil$ bits per location. However, this requires an external decoder circuit and limits the unit to activating only one control signal at a time.
Maximal Compatibility Classes (MCC): A design optimization technique used to group compatible control signals together into classes to find a minimal cover.
Minimal Cover and Essential Classes: The goal is to eliminate non-essential maximal compatibility classes while retaining "essential compatibility classes" to ensure all system control signals are represented in a minimized format.
 Analytical Calculations & Numerical Breakdowns
I. Control Memory Configuration and Capacity
Objective: Determine the total size or specific fields of a control memory based on hardware requirements.
Example Problem: A system requires 13 distinct control signals ($C\_0$ to $C\_{12}$). The control memory needs to store 512 locations. Each memory location includes a mode bit ($M$) and a branch address ($BA$).
Calculation for $BA$ field: Since there are 512 locations, the branch address field must be $\log\_2(512) = 9$ bits.
Calculation for Total Width: If using horizontal microprogramming (one bit per signal), the total width is:
$$\text{Total Width} = 1 \text{ (Mode)} + 9 \text{ (Branch Address)} + 13 \text{ (Control Signals)} = 23 \text{ bits per location}$$
II. Encoded vs. Horizontal Microinstruction Design
Objective: Compare the memory efficiency of direct control against encoded control.
Example Problem: A CPU has $n = 64$ control signals. Compare the control field width for horizontal versus fully encoded design.
Horizontal Design: Every signal gets an independent bit, making the field exactly 64 bits wide.
Fully Encoded Design: The number of bits needed is $\lceil \log\_2 n \rceil$, which evaluates to $\lceil \log_2 64 \rceil = $ 6 bits.
Constraint Note: While the encoded design is significantly more compact, it can only activate one control signal at a time because it uses a single decoder.
III. Microprogram Sequencing and Address Generation
Objective: Trace the addresses in the Control Memory Address Register (CMAR) for specific instructions.
Example Problem: Given the following fetch sequence:
$T0$ is at Address $00$.
$T1$ is at Address $01$.
$T2$ is at Address $02$.
Scenario: At $T2$, the instruction MOV R1, R2 is decoded, and the external address generator provides Address $L$.
Solution:
At $T0$: $BA = 01$, $M = 1$ (Sequential step).
At $T1$: $BA = 02$, $M = 1$ (Sequential step).
At $T2$: $BA = XX$ (don't care), $M = 0$ (Jump to external decoded address $L$).
At Address $L$ ($T3$): $BA = 00$, $M = 1$ (Return to start of the next fetch cycle).
IV. Minimal Cover and Compatibility Classes
Objective: Optimize control memory width by grouping signals that are never activated simultaneously.
Example Problem: Given microinstructions $I1 = \{a, b, c, g\}$ and $I\_2 = \{a, c, e, h\}$, evaluate signal compatibility.
Analysis: Signals $b$ and $e$ are compatible because they are never active in the same microinstruction ($b$ is in $I\_1$, $e$ is in $I\_2$). Signals $a$ and $b$ are incompatible because they both appear in $I\_1$ and must be activated simultaneously.
Goal: Group compatible signals into Maximal Compatibility Classes (MCC) to minimize the number of bits in the control field using a Cover Table.
📂 Source Documentation
Document Link: Microprogrammed Control & Microinstruction Design PDF


