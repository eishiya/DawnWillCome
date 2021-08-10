export const id = "EI_EVENT_SOUND_PLAY_EFFECT_PRECISE";

export const name = "Sound: Play Precise Sound";

export const fields = [
  {
    key: "type",
    type: "select",
	options: [
		["ch1", "Tone (Channel 1)"],
		["ch4", "Noise (Channel 4)"]
	],
    defaultValue: "ch1"
  },
  {
    key: "pattern",
    type: "select",
    label: "Wave pattern",
    conditions: [
      {
        key: "type",
        eq: "ch1"
      }
    ],
	options: [
		[0, "_-------_------- 12.5%"],
		[1, "__------__------ 25%"],
		[2, "____----____---- 50%"],
		[3, "______--______-- 75%"]
	],
    defaultValue: 2
  },
  {
    key: "frequency",
    type: "number",
    label: "Frequency",
    conditions: [
      {
        key: "type",
        eq: "ch1"
      }
    ],
    min: 0,
    max: 20000,
    step: 1,
    defaultValue: 200
  },
  {
    key: "sweeptype",
    type: "select",
    label: "Sweep Type",
	options: [
		[2, "None"],
		[0, "Increase frequency"],
		[1, "Decrease frequency"]
	],
    conditions: [
      {
        key: "type",
        eq: "ch1"
      },
    ],
    defaultValue: 2
  },
  {
    key: "sweeptime",
    type: "number",
    label: "Sweep Time in seconds",
    conditions: [
      {
        key: "type",
        eq: "ch1"
      },
      {
        key: "sweeptype",
        ne: 2
      }
    ],
    min: 0,
    max: 0.0546875,
    step: 0.0078125,
    defaultValue: 0.0234375,
	width: "50%"
  },
  {
    key: "sweepnumber",
    type: "number",
    label: "Sweep Shift",
    conditions: [
      {
        key: "type",
        eq: "ch1"
      },
	  {
		key: "sweeptype",
		ne: 2
	  }
    ],
    min: 0,
    max: 7,
    step: 1,
    defaultValue: 1,
	width: "50%"
  },
  {
    key: "clockfrequency",
    type: "slider",
    label: "Harshness",
    conditions: [
      {
        key: "type",
        eq: "ch4"
      }
    ],
    min: 0,
    max: 0x0F,
    step: 1,
    defaultValue: 2
  },
  {
    key: "pitch",
    type: "slider",
    label: "Pitch",
    conditions: [
      {
        key: "type",
        eq: "ch4"
      }
    ],
    min: 0,
    max: 7,
    step: 1,
    defaultValue: 3
  },
  {
    key: "counterstep",
    type: "checkbox",
    label: "Less noisy (beep)",
    conditions: [
      {
        key: "type",
        eq: "ch4"
      }
    ],
    defaultValue: true,
  },
  {
    key: "volume",
    type: "slider",
    label: "Volume",
    min: 0,
    max: 0x0F,
    step: 1,
    defaultValue: 0x0F
  },
  {
    key: "envelopetype",
    type: "select",
    label: "Envelope Type",
	options: [
		[2, "None"],
		[1, "Increase volume"],
		[0, "Decrease volume"]
    ],
    defaultValue: 2
  },
  {
    key: "envelopenumber",
    type: "slider",
    label: "Envelope length",
	conditions: [
	  {
	    key: "envelopetype",
	    ne: 2
	  }
	],
    min: 0,
    max: 7,
    step: 1,
    defaultValue: 1,
  },
  {
    key: "durationch1",
    type: "number",
    label: "Duration in seconds",
	conditions: [
      {
        key: "type",
        eq: "ch1"
      }
    ],
    min: 0,
    max: 4.25,
    step: 0.01,
    defaultValue: 0.5
  },
  {
    key: "durationch4",
    type: "number",
    label: "Duration in seconds",
	conditions: [
      {
        key: "type",
        eq: "ch4"
      }
    ],
    min: 0,
    max: 0.25,
    step: 1/256,
    defaultValue: 0.25
  },
  {
    key: "wait",
    type: "checkbox",
    label: "Wait until finished",
    defaultValue: true
  }
];

export const compile = (input, helpers) => {
  const {
	engineFieldSetToValue,
    soundStartTone,
    soundPlayCrash,
    wait
  } = helpers;
  
  var soundProperties; //sweep on ch1 (NR10), polynomial counter on ch4 (NR43)
  var seconds = 0;
  
  let volume = input.volume << 4;
  if(input.envelopetype < 2 && input.envelopenumber > 0) {
	  volume |= input.envelopetype << 3;
	  volume |= input.envelopenumber;
  }
  engineFieldSetToValue("sound_volume", volume);
  
  if(input.type === "ch1") { //Tone
    let pattern = input.pattern << 6;
	engineFieldSetToValue("sound_pattern", pattern);
	if(input.sweeptype < 2) {
		soundProperties = Math.round(input.sweeptime * 128) << 4;
		soundProperties |= (input.sweeptype << 3);
		soundProperties |= input.sweepnumber;
	} else {
		soundProperties = 0x00;
	}
	engineFieldSetToValue("sound_properties", soundProperties);
	
	const freq = typeof input.frequency === "number" ? input.frequency : 200;
    let period = (2048 - 131072 / freq + 0.5) | 0;
    if (period >= 2048) {
      period = 2047;
    }
    if (period < 0) {
      period = 0;
    }
	seconds = input.durationch1;
	const toneFrames = Math.min(255, Math.ceil(seconds * 60));
    soundStartTone(period, toneFrames);
  } else { //Noise
	seconds = input.durationch4;
	let time = Math.round(64 - 256*seconds);
	if(time < 0) {
	  time = 0;
	} else if (time > 63) {
	  time = 63;
	}
	engineFieldSetToValue("sound_time", time);

	soundProperties = input.clockfrequency << 4;
	soundProperties |= (input.counterstep? 7 : 15) << 3;
	soundProperties |= (7 - input.pitch);
	engineFieldSetToValue("sound_properties", soundProperties);
	
	soundPlayCrash();
  }

  /*let seconds = typeof input.duration === "number" ? input.duration : 0.5;

  if (input.type === "beep" || !input.type) {
    const pitch = typeof input.pitch === "number" ? input.pitch : 4;
	let time = Math.floor(64 - 256*seconds);
	if(time < 0) {
	  time = 0;
	} else if (time > 63) {
	  time = 63;
	}
	engineFieldSetToValue("sound_time", time);
    soundPlayBeep(9 - pitch);
  } else if (input.type === "tone") {
    const freq = typeof input.frequency === "number" ? input.frequency : 200;
    let period = (2048 - 131072 / freq + 0.5) | 0;
    if (period >= 2048) {
      period = 2047;
    }
    if (period < 0) {
      period = 0;
    }
    const toneFrames = Math.min(255, Math.ceil(seconds * 60));
    soundStartTone(period, toneFrames);
  } else if (input.type === "crash") {
	let time = Math.floor(64 - 256*seconds);
	if(time < 0) {
	  time = 0;
	} else if (time > 63) {
	  time = 63;
	}
	engineFieldSetToValue("sound_time", time);
	soundPlayCrash();
  }*/

  // Convert seconds into frames (60fps)
  if(input.wait) {
    while (seconds > 0) {
      const time = Math.min(seconds, 1);
      wait(Math.ceil(60 * time));
      seconds -= time;
    }
  }

};