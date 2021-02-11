/**
 * Copyright 2021 Ocean (iot.redplc@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
	"use strict";

	const syslib = require('./lib/syslib.js');
	const sysmodule = syslib.LoadModule("rpi_ads1x15.node");

	const DEV_ADS1115 = "1";

    RED.nodes.registerType("ads1x15", function(n) {
		var node = this;
		RED.nodes.createNode(node, n);

		node.devadr = parseInt(n.devadr);
		node.name = "@" + (0x48 + node.devadr).toString(16).toUpperCase();
		node.tagnameai = "IA" + n.addressai;

		node.factor0 = Number(n.factor0);
		node.factor1 = Number(n.factor1);
		node.factor2 = Number(n.factor2);
		node.factor3 = Number(n.factor3);

		node.offset0 = Number(n.offset0);
		node.offset1 = Number(n.offset1);
		node.offset2 = Number(n.offset2);
		node.offset3 = Number(n.offset3);

		node.store = node.context().global;
		node.iserror = false;
		node.setai = false;
			
		node.statustxt = "";

		if (sysmodule === undefined)
			node.iserror = syslib.outError(node, "sysmodules", "sysmodules not load");

		if (!node.iserror) {
			if (typeof node.store.keys().find(key => key == node.tagnameai) !== "undefined")
				node.iserror = syslib.outError(node, "duplicate " + node.tagnameai, "duplicate address " + node.tagnameai);
			else {
				node.store.set(node.tagnameai, [0, 0, 0, 0]);
				node.statustxt += " " + node.tagnameai;
				node.setai = true;
			}
		}

		if (!node.iserror) {
			if (sysmodule.inuse(node.devadr))
				node.iserror = syslib.outError(node, "in use", "node in use");
		}

		if (!node.iserror && !node.disableai) {
			sysmodule.setmuxAI(node.devadr, parseInt(n.mux0), parseInt(n.mux1), parseInt(n.mux2), parseInt(n.mux3));
			sysmodule.setgainAI(node.devadr, parseInt(n.gain0), parseInt(n.gain1), parseInt(n.gain2), parseInt(n.gain3));

			if (!sysmodule.initAI(node.devadr, n.devtyp == DEV_ADS1115))
				node.iserror = syslib.outError(node, "init AI", " error on init AI");
		}
		
		if (!node.iserror) {
			node.statustxt = node.statustxt.trim();
			syslib.setStatus(node, node.statustxt);
		}
		
		node.on("input", function (msg) {
			if (!node.iserror) {
				if (msg.payload === "input") {
					var aival = sysmodule.updateAI(node.devadr);

					if (aival === undefined)
						node.iserror = syslib.outError(node, "update AI", "error on update AI");
					else {
						aival[0] = aival[0] * node.factor0 + node.offset0;
						aival[1] = aival[1] * node.factor1 + node.offset1;
						aival[2] = aival[2] * node.factor2 + node.offset2;
						aival[3] = aival[3] * node.factor3 + node.offset3;
						node.store.set(node.tagnameai, aival);
						syslib.setStatus(node, node.statustxt);
					}
				}
			}

			node.send(msg);
		});

		node.on('close', function () {
			sysmodule.inuseClear();

			if (node.setai)
				node.store.set(node.tagnameai, undefined);
        });
 	});
}
