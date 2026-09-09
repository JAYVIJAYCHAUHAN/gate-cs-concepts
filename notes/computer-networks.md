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

```markdown
# Error Detection Essentials

## Purpose

Allows the receiver to detect bit errors caused by channel noise and discard bad packets.

## How It Works

1. **Sender:** Calculates a small code (hash/checksum) from the message and attaches it.
2. **Receiver:** Re-calculates the code on the received message.
3. **Comparison:** If the codes match, the message is accepted; if they don't, it is dropped.

# Cyclic Redundancy Check (CRC)

## Core Idea

Uses binary polynomial division to create check bits ($r$) appended to a $k$-bit message, making a total codeword of $n = k + r$ bits.

## Key Rules ($\mathbb{F}_2$ Math)

- Bit operations use **XOR** for both addition and subtraction.
- Valid codewords must be perfectly divisible by a fixed **generator polynomial** $g(x)$.

## Encoding Step

1. Shift the message left by $r$ bits (multiply message polynomial $m(x)$ by $x^r$).
2. Divide the shifted message by $g(x)$ using binary long division.
3. Append the remainder ($R$) as check bits to form the codeword $w(x)$.

## Decoding Step

- Divide the received codeword $r(x)$ by $g(x)$.
- If remainder $= 0$, no detected error.
- If remainder $\neq 0$, an error occurred.

---

# Error Detection Rules for CRC

An error $e(x)$ goes **undetected** only if it is a multiple of $g(x)$.

## 1. Single Bit Error

### Error Pattern

$$
e(x) = x^i
$$

### Rule

Detected if $g(x)$ has **2 or more terms**.

### Example

Given:

$$
g(x) = x^3 + 1
$$

Message error occurs at index 4:

$$
e(x) = x^4
$$

Check:

$$
\frac{x^4}{x^3 + 1} = x
\quad \text{with a remainder of } x
$$

### Result

Since the remainder is $x \neq 0$, the error is **detected**.

### Fails When

If:

$$
g(x) = x^3
$$

then:

$$
\frac{x^4}{x^3} = x
$$

with remainder $0$, so the error is **undetected**.

---

## 2. Double Bit Error

### Error Pattern

$$
e(x) = x^i + x^j
$$

where $j > i$.

### Rule

Detected if $g(x)$ does not divide:

$$
1 + x^{j-i}
$$

### Example

Errors occur at positions 2 and 5:

$$
e(x) = x^2 + x^5
$$

Factor:

$$
e(x) = x^2(1 + x^3)
$$

Let:

$$
g(x) = x^2 + 1
$$

Check whether $g(x)$ divides $(1+x^3)$:

$$
\frac{x^3 + 1}{x^2 + 1}
= x
\quad \text{with a remainder of } x+1
$$

### Result

Since the remainder is $x+1 \neq 0$, $g(x)$ does not divide $1+x^3$.

Therefore, the double bit error is **detected**.

---

## 3. Odd Number of Bit Errors

### Rule

Guaranteed to be detected if:

$$
(1+x)
$$

is a factor of $g(x)$.

This means $g(x)$ has an **even number of terms**.

### Example

Suppose 3 bit errors occur:

$$
e(x) = x^4 + x^2 + 1
$$

Let:

$$
g(x) = x+1
$$

Evaluate $e(x)$ at $x=1$ in $\mathbb{F}_2$:

$$
e(1) = 1^4 + 1^2 + 1
$$

$$
= 1+1+1 = 1 \neq 0
$$

### Result

For any polynomial $g(x)$ with factor $(1+x)$, every multiple must yield $0$ when $x=1$.

Since:

$$
e(1) = 1
$$

$e(x)$ can never be a multiple of $g(x)$.

Therefore, the odd error pattern is **guaranteed to be detected**.

---

## 4. Burst Error

Let $r$ be the degree of the generator polynomial $g(x)$.

### Rule 1: Burst Length $b \leq r$

Any burst error of length:

$$
b \leq r
$$

is **100% detected**.

### Example

Given:

$$
g(x) = x^4 + x + 1
$$

Degree:

$$
r = 4
$$

Suppose a burst error of length 3 occurs:

$$
e(x) = x^2(x^2+x+1)
$$

$$
= x^4+x^3+x^2
$$

The internal burst pattern polynomial is:

$$
x^2+x+1
$$

Its degree is $2$, which is less than the degree of $g(x)$, which is $4$.

Therefore, $g(x)$ can never divide it.

### Result

The remainder will be non-zero, so the burst error is **100% detected**.

---

### Rule 2: Burst Length $b = r+1$

For a burst of length:

$$
b = r+1
$$

**exactly 1 error pattern** goes undetected.

This occurs when the error pattern matches $g(x)$ itself.

### Example

Given:

$$
g(x) = x^4+x+1
$$

Degree:

$$
r=4
$$

Therefore:

$$
b=r+1=5
$$

Undetected burst pattern:

$$
10011
$$

Corresponding polynomial:

$$
e(x)=x^4+x+1
$$

Check:

$$
\frac{x^4+x+1}{x^4+x+1}=1
$$

with remainder $0$.

### Result

The remainder is $0$, meaning this specific burst error pattern slips through **undetected**.

Any other burst of length 5, such as `11001`, will leave a remainder and be detected.

---

# Common Standard Polynomials

- **CRC-1 (Parity Bit):**
  
  $$
  x+1
  $$

- **CRC-16-ANSI:**
  
  $$
  x^{16}+x^{15}+x^2+1
  $$

- **CRC-32-IEEE:**
  
  Degree 32 polynomial used in Ethernet and Wi-Fi.
```
https://web.mit.edu/6.02/www/f2010/handouts/lectures/L7.pdf
