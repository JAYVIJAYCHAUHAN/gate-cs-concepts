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

==================================================
Set Associative Visualization.
![Set-Associative](setasso.jpg)

