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

### Step-by-Step Example ($\frac{x^3 + 1}{x^2 + 1}$)
* **Dividend**: $x^3 + 1 \rightarrow \text{`1001`}$
* **Divisor**: $x^2 + 1 \rightarrow \text{`101`}$

```text
         x           <-- Quotient (x)
       _____________________
x^2+1 | x^3 + 0x^2 + 0x + 1
        x^3 + 0x^2 +  x      <-- XOR x * (x^2 + 1)
        -------------------
                      x + 1  <-- Remainder (x + 1)

1 0 1 0     <-- Quotient
       ________
 101  | 1 0 0 1 0 0
        1 0 1
        -----
          0 1 1 0
            1 0 1
            -----
              0 1 1 0
                0 0 0
                -----
                  1 1 <-- Remainder
# CRC Error Detection Rules (GATE CS)

## 1. Single Bit Error
* **Error Form**: $e(x) = x^i$
* **Rule**: Detected if the generator polynomial $g(x)$ has **2 or more terms**.

### Example
* **Given**: $g(x) = x^3 + 1$ (2 terms). Suppose an error occurs at bit index 4, giving $e(x) = x^4$.
* **Check**: Divide $e(x)$ by $g(x)$:
  $$\frac{x^4}{x^3 + 1} = x \quad \text{with a remainder of } x$$
* **Result**: Since the remainder $x \neq 0$, the error is **detected**.
* **Failure Case**: If $g(x) = x^3$ (only 1 term), then $\frac{x^4}{x^3} = x$ with a remainder of $0$, which goes **undetected**.

---

## 2. Double Bit Error
* **Error Form**: $e(x) = x^i + x^j = x^i(1 + x^{j-i})$ for $j > i$
* **Rule**: Detected if $g(x)$ does not divide $(1 + x^{j-i})$.

### Example
* **Given**: Errors occur at bit positions 2 and 5 ($i=2, j=5$), so $e(x) = x^2 + x^5 = x^2(1 + x^3)$. Let $g(x) = x^2 + 1$.
* **Check**: Test if $g(x) = x^2 + 1$ divides $(1 + x^3)$:
  $$\frac{x^3 + 1}{x^2 + 1} = x \quad \text{with a remainder of } x + 1$$
* **Result**: Since the remainder is $x + 1 \neq 0$, $g(x)$ does not divide $(1 + x^3)$. Thus, the double bit error is **detected**.

---

## 3. Odd Number of Bit Errors
* **Rule**: Guaranteed to be detected if $(1 + x)$ is a factor of $g(x)$ (i.e., $g(x)$ has an **even number of terms**).

### Example
* **Given**: An odd number of errors occur ($e(x) = x^4 + x^2 + 1$, which has 3 terms). Let $g(x) = x + 1$.
* **Check**: Evaluate $e(x)$ at $x = 1$ in $\mathbb{F}_2$ (XOR arithmetic):
  $$e(1) = 1^4 + 1^2 + 1 = 1 \oplus 1 \oplus 1 = 1 \neq 0$$
* **Result**: Any polynomial with a factor of $(1 + x)$ must evaluate to $0$ at $x = 1$. Because $e(1) = 1$, $e(x)$ can never be a multiple of $g(x)$. Thus, the odd-number error pattern is **guaranteed to be detected**.

---

## 4. Burst Error of Length $b$

### Rule 1: Length $b \le r$
* **Rule**: Any burst error of length $b \le r$ is **100% detected** (where $r$ is the degree of $g(x)$).

#### Example
* **Given**: $g(x) = x^4 + x + 1$ (degree $r = 4$). A burst error of length 3 occurs: $e(x) = x^2(x^2 + x + 1) = x^4 + x^3 + x^2$.
* **Check**: The internal burst pattern polynomial is $x^2 + x + 1$ (degree 2). Since its degree ($2$) is strictly less than the degree of $g(x)$ ($4$), $g(x)$ can never divide it.
* **Result**: The remainder will be non-zero, so the burst error is **100% detected**.

### Rule 2: Length $b = r + 1$
* **Rule**: For a burst of length $b = r + 1$, **exactly 1 error pattern** goes undetected (when the error pattern matches $g(x)$ itself).

#### Example
* **Given**: $g(x) = x^4 + x + 1$ (degree $r = 4$).
* **Undetected Pattern**: If the error burst pattern is `10011`, then $e(x) = x^4 + x + 1$.
* **Check**: Divide $e(x)$ by $g(x)$:
  $$\frac{x^4 + x + 1}{x^4 + x + 1} = 1 \quad \text{with a remainder of } 0$$
* **Result**: The remainder is $0$, meaning this specific burst error pattern **slips through undetected**. Any other burst of length 5 (e.g., `11001`) leaves a remainder and will be detected.

https://web.mit.edu/6.02/www/f2010/handouts/lectures/L7.pdf
