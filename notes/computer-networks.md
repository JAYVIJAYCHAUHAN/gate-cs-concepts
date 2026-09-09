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

````markdown
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
  $$w(x) = x^r m(x) + R\left\{ \frac{x^r m(x)}{g(x)} \right\}$$

  Where $m(x)$ is the message polynomial, $g(x)$ is the generator polynomial of degree $r$, and $R\{\dots\}$ represents the remainder.

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
x \phantom{{} + 0x^2 + 0x + 1} \quad \text{(Quotient)} \\
x^2 + 0x + 1
\begin{array}{\|l}
x^3 + 0x^2 + 0x + 1 \\
\underline{x^3 + 0x^2 + x\phantom{{} + 1}}
\quad \text{XOR } x \cdot (x^2 + 1) \\
\phantom{x^3 + 0x^2 + {}}x + 1
\quad \text{(Remainder)}
\end{array}
\end{array}
$$

#### Step-by-Step Breakdown

1. **Find Quotient Term**: Divide the highest term of dividend ($x^3$) by divisor ($x^2$):
   $$\frac{x^3}{x^2} = x$$

2. **Multiply and XOR**:
   $$x \cdot (x^2 + 1) = x^3 + x$$
   $$(x^3 + 1) \oplus (x^3 + x) = x + 1$$

3. **Check Condition**: Degree of remainder $(x + 1)$ is **1**, which is strictly less than divisor degree (**2**). Division stops.

* **Result**: Quotient = $x$, Remainder = $x + 1$.

---

### Example 2: Binary Bitwise Division (`100100` ÷ `101`)

```text
         1 0 1 0     <-- Quotient
       ________
 101  | 1 0 0 1 0 0
        1 0 1
        -----
          0 1 1 0
            1 0 1
            -----
              0 1 0
````

* **Result**: Quotient = `1010`, Remainder = `10`.

---

## 6. CRC Error Detection Rules (GATE CS Focus)

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

```


https://web.mit.edu/6.02/www/f2010/handouts/lectures/L7.pdf
