# Socket Programming and Networking

## Transport Protocols: TCP vs. UDP

### TCP (Transmission Control Protocol)

- Connection-oriented (virtual circuit service).
- Guarantees reliable, in-order delivery using acknowledgments (ACKs) and checksums.
- Operates as a byte-stream protocol with no record boundaries.
- Minimum header size is **20 bytes**.

### UDP (User Datagram Protocol)

- Connectionless datagram service.
- Unreliable; packets may be lost or arrive out of order.
- Has no retransmission mechanism.
- Lighter weight with a fixed **8-byte header**.

## Socket Identifiers & Demultiplexing

- **Transport Endpoint:** Identified by an IP address (32-bit for IPv4) and a port number (16-bit).

- **Socket Identification:** A TCP connection is uniquely identified by a 4-tuple:

  `(Local IP, Local Port, Foreign IP, Foreign Port)`

- **Protocol Control Block (PCB):** An OS table that tracks active sockets and maps incoming packets to the correct file descriptor/process.

## Socket System Calls Execution Flow

| **System Call** | **Role / Description** |
|---|---|
| `socket()` | Allocates an entry in the PCB table and returns a socket file descriptor. |
| `bind()` | Assigns a local IP address and port number to the socket. Setting port to `0` lets the OS pick an available port. |
| `listen()` | Sets a server TCP socket to state `LISTEN` to accept incoming connection requests; takes a `backlog` parameter specifying the queue size for pending connections. |
| `accept()` | Blocks waiting for a connection request. Returns a **new** socket descriptor dedicated to that specific connection session, leaving the original socket free to listen for new requests. |
| `connect()` | Used by the client to initiate a TCP 3-way handshake with the server's IP address and port. |
| `read()` / `write()` or `send()` / `recv()` | Used for exchanging data over connection-oriented TCP sockets. |
| `sendto()` / `recvfrom()` | Used for connectionless UDP communication where destination addresses are specified per packet. |
| `close()` / `shutdown()` | Releases resources or partially closes communication, disallowing sends or receives individually. |


https://soft.vub.ac.be/~tvcutsem/distsys/sockets.pdf 
https://www.csd.uoc.gr/~hy556/material/tutorials/cs556-3rd-tutorial.pdf

# Comprehensive Guide to Error Detection (GATE CS)

## 1. Overview of Error Detection

* **Purpose**: Used by the receiver to detect bit errors introduced during transmission so corrupted packets can be discarded.
* **Mechanism**:

  1. **Sender**: Calculates a small digest/checksum from the message and attaches it.
  2. **Receiver**: Re-computes the digest on the received message.
  3. **Comparison**: If the digests match, the message is accepted; if they differ, it is dropped.

---

## 2. Adler-32 Checksum

* **Core Idea**: Accumulates message bytes using position-dependent sums to prevent separate bit flips from canceling each other out.
* **Algorithm**: Processes message bytes $D_1, D_2, \dots, D_n$:

  * $A = (1 + \sum_{i=1}^n D_i) \bmod 65521$
  * $B = \sum_{i=1}^n A_i \bmod 65521$
  * **Final Value**: Combined into a 32-bit integer $(B \ll 16) + A$.
* **Key Constant**: Uses $65521$, the largest prime smaller than $2^{16}$ ($65536$).
* **Best Use**: Software-based applications and large files (e.g., zlib, rsync).

---

## 3. Cyclic Redundancy Check (CRC) Essentials

* **Type**: Polynomial code and cyclic linear block code.

* **Parameters**: Converts a $k$-bit message block into an $n$-bit codeword ($n = k + r$), where $r$ is the number of CRC check bits.

* **$\mathbb{F}_2$ Arithmetic Rules**:

  * All calculations use binary polynomial operations.
  * Addition and subtraction are both performed using the **XOR** operation (no carries/borrows).

* **Encoding Formula**:

  \(w(x) = x^r m(x) + R\left\{ \frac{x^r m(x)}{g(x)} \right\}\)

  Where $m(x)$ is the message polynomial, $g(x)$ is the generator polynomial of degree $r$, and $R{\dots}$ represents the remainder.

* **Divisibility Condition**: A codeword $w(x)$ is valid if and only if $g(x)$ divides $w(x)$ with a remainder of $0$.

---

## 4. Binary Long Division ($\mathbb{F}_2$)

### Mechanics

1. **Alignment**: Compare the leading bit of the divisor with the current dividend bit.
2. **XOR Step**: If the leading bit is `1`, XOR the divisor; if `0`, bring down the next bit.
3. **Termination**: Division stops when the degree of the remaining polynomial is strictly less than the degree of $g(x)$.

---

## 5. Detailed Division Examples

### Example 1: Polynomial Long Division ($\frac{x^3 + 1}{x^2 + 1}$)

#### Setup

* **Dividend**: $x^3 + 0x^2 + 0x + 1 \quad \rightarrow \quad \text{`1001`}$
* **Divisor**: $x^2 + 0x + 1 \quad \rightarrow \quad \text{`101`}$

#### Long Division Layout

$$
\begin{array}{r}
x \quad \text{(Quotient)} \\
x^2 + 0x + 1
\begin{array}{\|l}
x^3 + 0x^2 + 0x + 1 \\
\underline{x^3 + 0x^2 + x + 0}
\quad \text{XOR } x \cdot (x^2 + 1) \\
x + 1 \quad \text{(Remainder)}
\end{array}
\end{array}
$$

#### Step-by-Step Breakdown

1. **Find Quotient Term**: Divide the highest term of dividend ($x^3$) by divisor ($x^2$):

   \(\frac{x^3}{x^2} = x\)

2. **Multiply and XOR**:

   \(x \cdot (x^2 + 1) = x^3 + x\)

   \((x^3 + 1) \oplus (x^3 + x) = x + 1\)

3. **Check Condition**: Degree of remainder $(x + 1)$ is **1**, which is strictly less than divisor degree (**2**). Division stops.

* **Result**: Quotient = $x$, Remainder = $x + 1$.

---

### Example 2: Binary Bitwise Division (`100100` ÷ `101`)

```text
         1 0 1 1     <-- Quotient
       __________
 101  | 1 0 0 1 0 0
        1 0 1
        -----
          1 1 0 0
          1 0 1
          -----
            1 1 0
            1 0 1
            -----
              1 1  <-- Remainder
```

* **Result**: Quotient = `1011`, Remainder = `11`.

---

## 6. CRC Error Detection Rules 

An error polynomial $e(x)$ goes **undetected** if and only if $e(x)$ is a multiple of $g(x)$.

### Rule 1: Single Bit Error

* **Error Form**: $e(x) = x^i$
* **Condition**: Guaranteed to be detected if $g(x)$ has **2 or more terms**.
* **Example**:

  * Let $g(x) = x^3 + 1$ (2 terms) and $e(x) = x^4$.
  * $\frac{x^4}{x^3 + 1} = x$ with remainder $x \neq 0 \implies$ **Detected**.
  * If $g(x) = x^3$ (1 term), $\frac{x^4}{x^3} = x$ with remainder $0 \implies$ **Undetected**.

---

### Rule 2: Double Bit Error

* **Error Form**: $e(x) = x^i + x^j = x^i(1 + x^{j-i})$ for $j > i$
* **Condition**: Detected if $g(x)$ does not divide $(1 + x^{j-i})$.
* **Example**:

  * Let $i=2, j=5 \implies e(x) = x^2(1 + x^3)$. Let $g(x) = x^2 + 1$.
  * $\frac{x^3 + 1}{x^2 + 1} = x$ with remainder $x + 1 \neq 0 \implies$ **Detected**.

---

### Rule 3: Odd Number of Bit Errors

* **Condition**: Guaranteed to be detected if $(1 + x)$ is a factor of $g(x)$ (which gives $g(x)$ an **even number of terms**).
* **Example**:

  * Let $e(x) = x^4 + x^2 + 1$ (3 terms, odd) and $g(x) = x + 1$.
  * Evaluate $e(x)$ at $x = 1$: $e(1) = 1 \oplus 1 \oplus 1 = 1 \neq 0$.
  * Since any multiple of $(1+x)$ must evaluate to $0$ at $x=1$, $e(x)$ cannot be a multiple of $g(x) \implies$ **Guaranteed Detected**.

---

### Rule 4: Burst Error of Length $b$

1. **Burst Length $b \le r$**:

   * **Condition**: **100% detected** by any generator polynomial of degree $r$.
   * **Example**: $g(x) = x^4 + x + 1$ ($r=4$). An error burst pattern of degree 2 ($x^2+x+1$) has degree strictly less than $r=4$, so $g(x)$ can never divide it $\implies$ **100% Detected**.

2. **Burst Length $b = r + 1$**:

   * **Condition**: Exactly **1 error pattern** goes undetected (when the error pattern matches $g(x)$ itself).
   * **Example**: $g(x) = x^4 + x + 1$ ($r=4$). If $e(x) = x^4 + x + 1$ (`10011`), $\frac{e(x)}{g(x)} = 1$ with remainder $0 \implies$ **Undetected**.

---

## 7. Standard Generator Polynomials

* **CRC-1 (Parity Bit)**: $x + 1$
* **CRC-16-ANSI**: $x^{16} + x^{15} + x^2 + 1$
* **CRC-32-IEEE (Ethernet / Wi-Fi)**: $x^{32} + x^{26} + x^{23} + x^{22} + x^{16} + x^{12} + x^{11} + x^{10} + x^8 + x^7 + x^5 + x^4 + x^2 + x + 1$

https://web.mit.edu/6.02/www/f2010/handouts/lectures/L7.pdf


```markdown
# Error Detection Techniques (GATE CS Notes)

Error detection techniques add redundant bits to transmitted data so that bit errors caused by noise or channel interference can be identified at the receiver side.

---

## 1. Simple Parity Check

### Concept
Appends a single parity bit to the data block to make the total count of `1`s either even (Even Parity) or odd (Odd Parity).

### Sender & Receiver Logic
* **Sender Side:** Counts the number of `1`s in the data stream $\rightarrow$ appends `1` if required to achieve the desired parity, else appends `0`.
* **Receiver Side:** Counts all `1`s in the received frame. If the parity condition is violated, an error is flagged.

### Example (Even Parity)
* **Data:** `0110100` (contains three `1`s)
* **Sender Transmits:** `01101001` (4 ones $\rightarrow$ Even parity satisfied)
* **Receiver Case 1 (1-Bit Error):** Receives `01101101` (5 ones = Odd) $\rightarrow$ **Error detected!**
* **Receiver Case 2 (2-Bit Error):** Receives `00101101` (4 ones = Even) $\rightarrow$ **Undetected!**

### GATE CS Key Takeaways
* **Capabilities:** Detects **all 1-bit errors** and **any odd number of bit errors**.
* **Limitations:** Fails to detect an **even number of bit errors** (e.g., 2-bit, 4-bit errors cancel each other out).
* **Overhead:** Exactly **$1$ bit** per frame.

---

## 2. Two-Dimensional (2D) Parity Check

### Concept
Arranges data into an $M \times N$ matrix. A parity bit is computed for each row, a parity bit for each column, and an overall parity byte for the entire frame.

### Sender & Receiver Logic
* **Sender Side:**
  1. Fits data blocks into a grid/matrix structure.
  2. Computes and appends a parity bit for every row.
  3. Computes and appends a column parity byte at the bottom.
* **Receiver Side:** Re-evaluates parity across every row and column.
  * If a single row and a single column fail, the error is at their exact intersection (**Error Correction**).

---

### Original Frame Sent by Sender

Sender arranges 5 data words of 7 bits each and appends Row Parity and Column Parity bits:

```text
d1  d2  d3  d4  d5  d6  d7  | Row Parity
---------------------------------------
0   1   1   0   1   0   0   | 1
1   0   1   1   0   1   0   | 0
0   0   1   0   1   1   0   | 1
1   1   1   0   1   0   1   | 1
1   0   0   1   0   1   1   | 0
---------------------------------------
1   0   0   0   1   1   0   | 1  <-- Column Parity Byte

```

---

### Error Scenarios

#### 1-Bit Error Example (Detected & Corrected)

Scenario: Bit at Row 3, Column 3 flips during transmission ($1 \rightarrow 0$).

```text
d1  d2  d3  d4  d5  d6  d7  | Row Parity
---------------------------------------
0   1   1   0   1   0   0   | 1
1   0   1   1   0   1   0   | 0
0   0  [0]* 0   1   1   0   | 1  <-- FAIL: Row 3 (3 ones = Odd)
1   1   1   0   1   0   1   | 1
1   0   0   1   0   1   1   | 0
---------------------------------------
1   0  [0]* 0   1   1   0   | 1
        ^
      FAIL: Col 3 (1 one = Odd)

```

* **Detection:** Row 3 parity check fails. Column 3 parity check fails.
* **Correction:** Intersection of Row 3 and Column 3 pinpoints the exact corrupted bit.
* **Action:** Flip bit at (Row 3, Col 3) from 0 to 1 $\rightarrow$ **CORRECTED**.

---

#### 2-Bit Error Example (Detected, Not Correctable)

Scenario: Bits at (Row 3, Col 3) AND (Row 3, Col 4) flip during transmission.

```text
d1  d2  d3  d4  d5  d6  d7  | Row Parity
---------------------------------------
0   1   1   0   1   0   0   | 1
1   0   1   1   0   1   0   | 0
0   0  [0]*[1]* 1   1   0   | 1  <-- PASS: Row 3 (4 ones = Even)
1   1   1   0   1   0   1   | 1
1   0   0   1   0   1   1   | 0
---------------------------------------
1   0  [0]*[1]* 1   1   0   | 1
        ^   ^
      FAIL FAIL (Col 3 & Col 4)

```

* **Detection:** Column 3 and Column 4 parity checks fail. Row 3 passes because two errors cancel out row parity.
* **Result:** **ERROR DETECTED**.
* **Correction:** **CANNOT CORRECT**. Exact bit locations cannot be isolated because no row failed.

---

#### 3-Bit Error Example (Detected)

Scenario: Bits at (Row 3, Col 3), (Row 3, Col 4), AND (Row 4, Col 3) flip during transmission.

```text
d1  d2  d3  d4  d5  d6  d7  | Row Parity
---------------------------------------
0   1   1   0   1   0   0   | 1
1   0   1   1   0   1   0   | 0
0   0  [0]*[1]* 1   1   0   | 1  <-- PASS: Row 3 (4 ones = Even)
1   1  [0]* 0   1   0   1   | 1  <-- FAIL: Row 4
1   0   0   1   0   1   1   | 0
---------------------------------------
1   0  [1]*[1]* 1   1   0   | 1
        ^   ^
      FAIL FAIL (Col 3 & Col 4)

```

* **Detection:** Row 4, Column 3, and Column 4 all flag parity violations.
* **Result:** **ERROR DETECTED**.
* **Correction:** **CANNOT CORRECT**.

---

#### 4-Bit Error Example (Undetected Rectangle Pattern)

Scenario: 4 bits forming a rectangle at intersections (Row 3, Col 3), (Row 3, Col 4), (Row 4, Col 3), and (Row 4, Col 4) flip.

```text
d1  d2  d3  d4  d5  d6  d7  | Row Parity
---------------------------------------
0   1   1   0   1   0   0   | 1
1   0   1   1   0   1   0   | 0
0   0  [0]*[1]* 1   1   0   | 1  <-- PASS: Row 3 parity cancels out
1   1  [0]*[1]* 1   0   1   | 1  <-- PASS: Row 4 parity cancels out
1   0   0   1   0   1   1   | 0
---------------------------------------
1   0  [0]*[0]* 1   1   0   | 1
        ^   ^
       PASS PASS (Col 3 & Col 4 cancel out)

```

* **Detection:** All rows pass parity checks. All columns pass parity checks.
* **Result:** **UNDETECTED ERROR!**

---

### GATE CS Key Takeaways for 2D Parity

| Error Type | Detection Status | Correction Status |
| --- | --- | --- |
| **1-Bit Error** | Always Detected | **Correctable** (At Row & Col intersection) |
| **2-Bit Error** | Always Detected | Not Correctable |
| **3-Bit Error** | Always Detected | Not Correctable |
| **4-Bit Error** | Detected EXCEPT when 4 errors form a rectangle | Not Correctable |

---
## 3. Internet Checksum

### Concept
Divides data into equal $k$-bit words (typically 16-bit) and calculates their sum using **1's complement addition** (wrap carry-out bits around to the least significant bit).

### Sender & Receiver Logic
* **Sender Side:**
  1. Sums all 16-bit words using 1's complement addition.
  2. Bitwise inverts (NOT) the final sum to produce the **Checksum**.
  3. Transmits `Data Words + Checksum`.
* **Receiver Side:**
  1. Sums all received data words plus the Checksum word using 1's complement addition.
  2. Bitwise inverts the result.
  3. If result is all `0`s (`0000...0`), packet is **Valid**; otherwise, an **Error is detected**.

![CheckSumExample](CheckSumExample.JPG)
  

### GATE CS Key Takeaways
* **Software-Friendly:** Widely used in transport and network layers (TCP, UDP, IP).
* **Limitations:** Fails if **data words swap positions** (since addition is commutative) or if complementary errors cancel out in corresponding bit positions.

### GATE CS Key Takeaways
* **Software-Friendly:** Widely used in transport and network layers (TCP, UDP, IP).
* **Limitations:** Fails if **data words swap positions** (since addition is commutative) or if complementary errors cancel out in corresponding bit positions.

https://mislove.org/teaching/cs4700/spring11/lectures/lecture13.pdf
```

```
# Ethernet & CSMA/CD Fundamentals

## CSMA/CD Mechanism

CSMA/CD stands for **Carrier Sense Multiple Access with Collision Detect**.

1. **Carrier Sense:** Listen before transmitting. If the line is busy, wait until it becomes quiet, then wait an additional **9.6 $\mu\text{s}$ (96 bit times)** as the inter-frame gap.

2. **Multiple Access:** Multiple hosts share the same broadcast medium.

3. **Collision Detect:** Monitor the line while transmitting. If a collision occurs, stop immediately and send a **32–48 bit jam signal**.

## Frame Structure

- **Preamble & SFD:** 8 bytes (used for synchronization).
- **Destination MAC Address:** 6 bytes (48 bits).
- **Source MAC Address:** 6 bytes (48 bits).
- **Type/Length:** 2 bytes.
- **Data/Payload:** 46 to 1500 bytes.
- **CRC Checksum:** 4 bytes.

### Frame Size Limits

- **Minimum frame size:** 64 bytes (512 bits).
- **Maximum frame size:** 1518 bytes (excluding preamble/SFD).

---

# Crucial GATE Formulas

## 1. Propagation Delay ($T_p$)

$$
T_p = \frac{\text{Distance } (D)}{\text{Propagation Speed } (v)}
$$

## 2. Transmission Delay ($T_t$)

$$
T_t = \frac{\text{Frame Size } (L)}{\text{Bandwidth } (B)}
$$

## 3. Collision Detection Condition

To guarantee collision detection before transmission finishes, the transmission time must be at least twice the propagation delay:

$$
T_t \geq 2 \times T_p
$$

Therefore:

$$
\frac{L}{B} \geq 2 \times \frac{D}{v}
$$

### Minimum Frame Size

$$
L_{\min} = 2 \times T_p \times B
$$

## 4. Slot Time

$$
\text{Slot Time} = 2 \times T_p
$$

Slot time is equal to the time required to transmit the minimum frame size.

For **10 Mbps Ethernet**:

$$
64\text{ bytes} = 512\text{ bits}
$$

$$
\text{Slot Time} = \frac{512}{10 \times 10^6}
= 51.2\ \mu\text{s}
$$

## 5. Efficiency ($\eta$)

$$
\eta = \frac{1}{1 + 6.44 \times a}
$$

where:

$$
a = \frac{T_p}{T_t}
$$

---

# Binary Exponential Backoff Algorithm

## Backoff Window

For collision count $N$, where:

$$
1 \leq N \leq 10
$$

choose a random backoff multiplier $k$ from:

$$
0 \leq k < 2^N
$$

## Backoff Limit

For:

$$
11 \leq N \leq 15
$$

$k$ is chosen from:

$$
0 \leq k < 1024
$$

because:

$$
2^{10} = 1024
$$

## Maximum Retries

If:

$$
N = 16
$$

the packet is discarded due to transmission failure.

## Backoff Delay

$$
\text{Wait Time} = k \times \text{Slot Time}
$$

For 10 Mbps Ethernet:

$$
\text{Wait Time} = k \times 51.2\ \mu\text{s}
$$

---

# Solved Numerical Examples

## Example 1: Minimum Frame Size Calculation

> **Question:** A 1 Gbps CSMA/CD network has a cable length of 1 km. Propagation speed in the cable is $2 \times 10^8 \text{ m/s}$. Find the minimum frame size required for proper collision detection.

### Step 1: Calculate Propagation Delay ($T_p$)

$$
T_p = \frac{D}{v}
$$

$$
T_p =
\frac{1000\text{ m}}
{2 \times 10^8\text{ m/s}}
$$

$$
T_p = 5 \times 10^{-6}\text{ s}
= 5\ \mu\text{s}
$$

### Step 2: Calculate Round Trip Time

$$
2 \times T_p
= 2 \times 5\ \mu\text{s}
= 10\ \mu\text{s}
$$

### Step 3: Calculate Minimum Frame Size

$$
L_{\min} = B \times (2 \times T_p)
$$

$$
L_{\min}
=
(10^9\text{ bits/sec})
\times
(10 \times 10^{-6}\text{ sec})
$$

$$
L_{\min} = 10^4\text{ bits}
$$

Convert bits to bytes:

$$
L_{\min}
=
\frac{10^4}{8}
=
1250\text{ bytes}
$$

### Answer

$$
\boxed{L_{\min}=1250\text{ bytes}}
$$

---

## Example 2: Exponential Backoff Waiting Time

> **Question:** Two stations on a 10 Mbps Ethernet network collide on their $3^{\text{rd}}$ attempt ($N=3$). What is the maximum backoff time either station can experience before retransmitting? Given Slot Time = $51.2\ \mu\text{s}$.

### Step 1: Determine the Range for Random Multiplier $k$

For:

$$
N=3
$$

$$
0 \leq k < 2^3
$$

Therefore:

$$
k \in \{0,1,2,3,4,5,6,7\}
$$

### Step 2: Find Maximum Value of $k$

$$
k_{\max}=7
$$

### Step 3: Calculate Maximum Backoff Time

$$
\text{Max Time}
=
k_{\max}\times\text{Slot Time}
$$

$$
=7\times51.2\ \mu\text{s}
$$

$$
=358.4\ \mu\text{s}
$$

### Answer

$$
\boxed{358.4\ \mu\text{s}}
$$

---

## Example 3: Maximum Segment Length

> **Question:** An Ethernet network operates at 10 Mbps with a minimum frame size of 64 bytes. If the signal velocity in copper is $2 \times 10^8\text{ m/s}$, find the maximum allowable network diameter.

### Step 1: Calculate Transmission Time of Minimum Frame

Minimum frame size:

$$
64\text{ bytes}=64\times8=512\text{ bits}
$$

Therefore:

$$
T_t
=
\frac{64\times8\text{ bits}}
{10\times10^6\text{ bits/s}}
$$

$$
T_t
=
\frac{512}{10^7}
=
51.2\ \mu\text{s}
$$

### Step 2: Apply Collision Detection Condition

$$
T_t \geq 2\times T_p
$$

Therefore:

$$
51.2\ \mu\text{s}
\geq
2\times\frac{D}{v}
$$

Substitute:

$$
51.2\times10^{-6}
\geq
2\times
\frac{D}{2\times10^8}
$$

Simplifying:

$$
D
\leq
(51.2\times10^{-6})(10^8)
$$

$$
D\leq5120\text{ m}
$$

Convert to kilometers:

$$
D\leq5.12\text{ km}
$$

### Answer

$$
\boxed{D_{\max}=5.12\text{ km}}
$$
