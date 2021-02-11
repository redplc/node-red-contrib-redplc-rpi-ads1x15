# node-red-contrib-redplc-ads1x15

Node-Red node for ads1015-12bit/ads1115-16bit adc.<br>

## Node Features
- Supports ads1015/ads1115 analog to digital converter
- Each input can be selected Single-Ended, Differential or Disabled
- ads1015 12bit conversion time 1ms/channel
- ads1115 16bit conversion time 10ms/channel
- Four selectable I2C addresses 
- Output value is in mV
- Input range +/- 6.144V, 4.096V, 2.048V, 1.024V, 0.512V or 0.256V
- Scaling with factor and offset

## Install

For using with Ladder-Logic install
[redPlc](https://www.npmjs.com/package/node-red-contrib-redplc)

For using with other nodes, install
[module-nodes](https://www.npmjs.com/package/node-red-contrib-redplc-module)

Install with Node-Red Palette Manager or npm command:
```
cd ~/.node-red
npm install node-red-contrib-redplc-ads1x15
```

## Usage
This node writes to Node-Red global variables.<br>
Update is triggered by redPlc cpu node<br>
or module-update node.<br>
This node works only on Raspberry Pi with Raspberry Pi OS.<br>
Enable I2C with raspi-config.<br>
Consult datasheet for absolute maximum ratings.<br>

### Analog Input (Variable IA):
*Single-Ended Mode:*
|Input|Array-Index|
|:----|:-:|
|IA0-GND|0|
|IA1-GND|1|
|IA2-GND|2|
|IA3-GND|3|

*Two Differential Inputs Mode:*
|Input|Array-Index|
|:----|:-:|
|AI0-AI1|0|
|AI1-AI3|1|
|AI2-AI3|2|
|AI0-AI3|3|

### Scaling with Factor and Offset:

```
Formula:

Factor = (OH - OL) / (IH - IL)
Offset = OL - (IL * Factor)

Output = Input * Factor + Offset

Where:

IL = Input Low (mV), IH = Input High (mV) 
OL = Output Low, OH = Output High
```
### Example:
Input:  0mV .. 10000mV, IL = 0, IH = 10000<br>
Output: -20°C .. 60°C, OL = -20, OH = 60<br>
**Factor** = (60 - (-20)) / (10000 - 0) = **0.008**<br>
**Offset** = (-20) - (0 * 0.008) = **-20**<br>

Input = 4000mV<br>
Output = 4000 * 0.008 + (-20) = 12°C<br>

## Donate
If you like my work please support it with donate:

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZDRCZBQFWV3A6)
