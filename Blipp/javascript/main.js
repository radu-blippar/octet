var blipp = require('blippar').blipp;
scene = blipp.addScene();

scene.addRequiredAssets('BACKGROUND_looped.mp4');

// Global variables
var mW = blipp.getMarker().getWidth();
var mH = blipp.getMarker().getHeight();
var sW = blipp.getScreenWidth() * 1.003;
var sH = blipp.getScreenHeight() * 1.003;

var TelemetryID = "US_SANOFI_VIA_HAVAS_HEALTH_1612_OCTET";
var DrugsHeight = 53;
var DrugsY = -(0.5 * (1024 * sW / sH) - 288 + 256);
var DrugsDefaultColor = 'ffffff';
var DrugsTextColor = ['4da6d2', 'ffffff'];

var Drugs = [
  ['DPP-4i', 133, -445, '007eff', [0, 1, 3]],
  ['GLP-1 RA', 133, -308, '00c124', [0, 1, 2, 3, 5]],
  ['Insulin', 133, -171, 'b3a7a2', [1, 3, 4, 7]],
  ['Metformin', 133, -34, '00b1b1', [3]],
  ['SGLT-2i', 133, 103, 'ffd100', [6]],
  ['Sulfonylurea', 133, 240, 'ff5e37', [0]],
  ['TZD', 133, 377, 'fc72a8', [3, 4, 7]],
  ['All', 64, 480, '4da6d2']
];

var Organs = [
  ['PANCREAS', [-339, 38],
    [-74 - 2, 63 + 2] // Position change
  ],
  ['alpha-ISLET CELL', [-263, -113],
    [-103, -39]
  ],
  ['GI TRACT', [-202, 125],
    [-72, 64]
  ],
  ['LIVER', [-76, -55],
    [-58, 63]
  ],
  ['ADIPOSE CELL', [43, 63],
    [91, 64]
  ],
  ['BRAIN', [127, -100],
    [81, -35]
  ],
  ['KIDNEY', [300, 144],
    [67, 66]
  ],
  ['MUSCLE', [311, -36],
    [91, -35]
  ]
];

var Buttons = [];
var ButtonTexts = [];
var ButtonColors = [];
var DrugGlows = [];
var DrugTextGlows = [];

var Icons = [];
var IconSegments = [];
var IconOrgans = [];
var IconGlows = [];
var IconPivots = [];

var Clickables = [];

var OrganWobbleRadius = 4;
var OrganWobbleTime = 12; // Frames
var PopUpDelay = 8; // s
var ActivePopUp = 0;
var VisiblePopUp = false;
var Clicks = 0;
var MinClicksForPopUp = 2;

function Telemetry(msg) {
  console.log("TELEMETRY: " + msg)
  blipp.telemetry(TelemetryID, msg);
}

function SetOrgans(tap) {
  for (var i = 0; i < Drugs.length - 1; i++) {
    if (ButtonColors[i].isSelected) {
      for (var j = 0; j < Drugs[i][4].length; j++) {
        var n = Drugs[i][4][j];
        if (IconSegments[n][i].getAlpha() < 0.9) {
          IconPivots[n].animate().scale(1.414).duration(250).interpolator('easeInOut').onEnd = function () {
            this.animate().scale(1).duration(500).interpolator('easeInOut')
          }
        }
        IconSegments[n][i].setColor(Drugs[i][3]).setAlpha(1);
        IconOrgans[n].setColor(DrugsTextColor[0]).setAlpha(1);
        IconGlows[n].setAlpha(1);
        IconGlows[n].newPulse = true;
        IconGlows[n].isPulsing = true;
      }
    } else {
      for (var j = 0; j < Organs.length; j++) {
        IconSegments[j][i].setColor(DrugsTextColor[1]).setAlpha(0.3);
        IconOrgans[j].setColor(DrugsTextColor[1]).setAlpha(0.75);
        IconGlows[j].setAlpha(0);
      }
    }
  }
}

var CurrentPopUps;
var PopUpScaler = 0.7;

function StartPopUp(popups, closeDark) {
  if (!VisiblePopUp) {
    VisiblePopUp = true;
    CurrentPopUps = popups;
    Dark.setHidden(false);
    Dark.setAlpha(0);
    Dark.animate().alpha(0.6).duration(500);
    Dark.setClickable(closeDark);
    for (i = 0; i < CurrentPopUps.length; i++) {
      CurrentPopUps[i].setHidden(false).setAlpha(0);
      var s = CurrentPopUps[i].getScale();
      s[0] *= PopUpScaler;
      s[1] *= PopUpScaler;
      s[2] *= PopUpScaler;
      CurrentPopUps[i].setScale(s)
      CurrentPopUps[i].animate().alpha(1).duration(500);
      CurrentPopUps[i].animate().duration(300)
        .scaleX(s[0] / PopUpScaler)
        .scaleY(s[1] / PopUpScaler)
        .scaleZ(s[2] / PopUpScaler)
        .interpolator('easeOut');
    }
    for (i = 0; i < Clickables.length; i++) {
      Clickables[i].setClickable(false);
    }
    Close_Button.OFF();
  }
}

function StartPopUp_0() {
  ActivePopUp++
  StartPopUp([PopUp_0, PopUp_0_Back], false)
}

function StartPopUp_1() {
  ActivePopUp++
  StartPopUp([PopUp_1, PopUp_1_Back, PopUp_1_Link], false)
}

function StartPopUp_2() {
  ActivePopUp++
  StartPopUp([PopUp_2, PopUp_2_Back, PopUp_2_Link], false)
}

function StartPopUp_3() {
  ActivePopUp++
  StartPopUp([PopUp_3, PopUp_3_Back, PopUp_3_Link], false)
}

function EndPopUp(next) {
  VisiblePopUp = false;
  Close_Button.ON();
  Dark.setHidden(true);
  for (i = 0; i < CurrentPopUps.length; i++) {
    CurrentPopUps[i].setHidden(true);
  }
  for (i = 0; i < Clickables.length; i++) {
    Clickables[i].setClickable(true);
  }

  if (next && ActivePopUp < 4) {
    scene.animate().duration(PopUpDelay * 1000).onEnd = function () {
      NextPopUp();
    }
  }

  if (!StartedPopUps) {
    StartedPopUps = true;
    scene.animate().duration(PopUpDelay * 1000).onEnd = function () {
      NextPopUp();
    }
  }
}

function NextPopUp() {
  console.log(ActivePopUp + " - " + VisiblePopUp)
  if (!VisiblePopUp) {
    switch (ActivePopUp) {
    case 0:
      StartPopUp_0();
      break;
    case 1:
      StartPopUp_1();
      break;
    case 2:
      StartPopUp_2();
      break;
    case 3:
      StartPopUp_3();
      break;
    }
  } else {
    if (ActivePopUp < 4) {
      scene.animate().duration(PopUpDelay * 1000).onEnd = function () {
        NextPopUp();
      }
    }
  }
}

function GlowDrugs() {
  for (i = 0; i < DrugGlows.length; i++) {
    DrugGlows[i].onDraw();
    DrugTextGlows[i].onDraw();
  }
}

scene.onCreate = function () {

  blipp.hideUiComponents('navbar')
  blipp.hideUiComponents('peelCloseButton')

  Screen = scene.getScreen().addTransform().setRotationZ(-90).setScale(sH / 1024);

  Background = Screen.addSprite('Background.jpg').setScale([(16 / 9) * 1024 * sW / sH, 1024 * sW / sH, 1]);

  /*
  Background.CheckVideo = function () {
    if (blipp.getAssetStat('BACKGROUND_looped.mp4') > 0) {
      this.playVideo('BACKGROUND_looped.mp4', '', true, false, false);
    } else {
      scene.animate().duration(250).onEnd = function () {
        Background.CheckVideo();
      }
    }
  }
  */

  Background.onDraw = function () {
    this.playVideo('BACKGROUND_looped.mp4', '', true, false, false);
    /*
    Background.CheckVideo();
    blipp.downloadAssets(
      '', ['BACKGROUND_looped.mp4'],
      'get',
      function (status, info) {
        if (status == 'OK') {
          console.log('BACKGROUND_looped.mp4: Download Done');
        } else {
          console.log('BACKGROUND_looped.mp4: Loaded ' + info + ' %');
        }
      }, "", false);
    return 1
    */
  }

  Pulse = Screen.addSprite('trans.png');

  Pulse.onDraw = function () {
    this.animate().scale(0.95).duration(400).interpolator('easeInOut').onEnd = function () {
      this.animate().scale(1).duration(400).interpolator('easeInOut').onEnd = function () {
        this.onDraw();
      }
    }
    return 1
  }

  //Pulse_show = Pulse.addSprite().setColor('ff000080').setScale(256).setCornerRadius(128);

  Logo = Screen.addSprite(['Logo.png', 'Logo-A.jpg'])
    .setScale(512)
    .setTranslationY(0.5 * (1024 * sW / sH) - 288 + 210);

  DrugClasses = Screen.addSprite(['DrugClasses.png', 'DrugClasses-A.png'])
    .setScale(1024, 32, 1)
    .setTranslationY(-(0.5 * (1024 * sW / sH) - 288 + 213));


  for (var i = 0; i < Organs.length; i++) {
    var t = Screen.addTransform()
      .setTranslationX(Organs[i][1][0])
      .setTranslationY(Organs[i][1][1]);

    t_pivot = t.addSprite('trans.png');
    t_pivot.n = i;
    t_pivot.wobble = 0;

    t_pivot.onUpdate = function () {
      if (IconGlows[this.n].getAlpha() != 0) {
        if (IconGlows[this.n].newPulse) {
          IconGlows[this.n].newPulse = false;
          this.animate().duration(OrganWobbleTime * 1000 / 30)
            .translationX(0)
            .translationY(0);
        } else {
          if (this.getScale()[0] <= 1) {
            IconGlows[this.n].isPulsing = true;
            this.setScale(Pulse.getScale()[0]);
          }
        }
      } else {
        this.wobble++;
        IconGlows[this.n].isPulsing = false;
        if (this.wobble >= OrganWobbleTime) {
          this.wobble = 0;
          this.animate().duration(OrganWobbleTime * 1000 / 30)
            .translationX(OrganWobbleRadius * (Math.random() - 0.5))
            .translationY(OrganWobbleRadius * (Math.random() - 0.5));
        }
      }
    }

    g = t_pivot.addSprite(['White_256x256.png', 'OrganGlow.jpg']).setScale(256).setAlpha(0);
    g.newPulse = false;
    g.isPulsing = false;

    o = t_pivot.addSprite(['White_256x256.png', 'Organ' + i + '.png'])
      .setAlpha(0.75).setScale(128)

    name = t.addSprite(['Organ' + i + '_name.png', 'Organ' + i + '_name-A.png'])
      .setScale([128, 32, 1])
      .setTranslationX(Organs[i][2][0])
      .setTranslationY(Organs[i][2][1]);

    var segs = [];

    for (var j = 0; j < Drugs.length - 1; j++) {
      var s = t_pivot.addSprite(['White_256x256.png', 'OrganSegment.png'])
        .setAlpha(0.3).setScale(128).setRotationZ(-j * 360 / (Drugs.length - 1));
      s.Color = Drugs[j][3];
      segs.push(s);
    }

    IconSegments.push(segs);
    IconOrgans.push(o);
    IconGlows.push(g);
    IconPivots.push(t_pivot);
    Icons.push(t);
  }

  for (var i = 0; i < Drugs.length; i++) {
    var t = Screen.addTransform()
      .setTranslationX(Drugs[i][2])
      .setTranslationY(DrugsY);

    b = t.addSprite()
      .setScale(Drugs[i][1], DrugsHeight, 1)
      .setHotspot([0, 0, 0, 1, 2, 1])
      .setAlpha(0.8)
      .setColor(DrugsDefaultColor);
    b.n = i;
    b.isSelected = false;
    b.onTouchEnd = function () {
      this.isSelected = !this.isSelected;
      if (this.n == 7) {
        for (var i = 0; i < Drugs.length; i++) {
          if (this.isSelected) {
            Telemetry('Tap_' + Drugs[this.n][0] + '_Animation_main_menu_select');
            ButtonColors[i].isSelected = true;
            ButtonColors[i].setColor(Drugs[i][3])
            ButtonTexts[i].setActiveTexture(1).setColor(DrugsTextColor[1])
          } else {
            Telemetry('Tap_' + Drugs[this.n][0] + '_Animation_main_menu_deselect');
            ButtonColors[i].isSelected = false;
            ButtonColors[i].setColor(DrugsDefaultColor)
            ButtonTexts[i].setActiveTexture(0).setColor(DrugsTextColor[0])
          }
        }
      }

      if (this.isSelected) {
        this.setColor(Drugs[this.n][3])
        ButtonTexts[this.n].setActiveTexture(1).setColor(DrugsTextColor[1])
      } else {
        this.setColor(DrugsDefaultColor)
        ButtonTexts[this.n].setActiveTexture(0).setColor(DrugsTextColor[0])

        if (ButtonColors[Drugs.length - 1].isSelected) {
          ButtonColors[Drugs.length - 1].isSelected = false;
          ButtonColors[Drugs.length - 1].setColor(DrugsDefaultColor)
          ButtonTexts[Drugs.length - 1].setActiveTexture(0).setColor(DrugsTextColor[0])
        }
      }

      SetOrgans(this.n)
    }

    glow = b.addSprite().setColor(Drugs[i][3]).setAlpha(0);
    glow.n = i;
    glow.onDraw = function () {
      this.animate().alpha(0.6).duration(600).delay(this.n * 100).onEnd = function () {
        this.animate().alpha(0).duration(600);
      }
      return 1
    }

    text = t.addSprite()
      .setScale(128, 32, 1)
      .setTextures([
        ['White_256X64.png', 'Drug' + i + '.png'],
        ['White_256X64.png', 'Drug' + i + 's.png']
      ])
      .setTexturesPreload(true)
      .setActiveTexture(0)
      .setColor(DrugsTextColor[0]);

    textGlow = t.addSprite()
      .setScale(128, 32, 1)
      .setTextures([
        ['White_256X64.png', 'Drug' + i + '.png'],
        ['White_256X64.png', 'Drug' + i + 's.png']
      ])
      .setTexturesPreload(true)
      .setActiveTexture(1)
      .setAlpha(0)
      .setColor(DrugsTextColor[1]);
    textGlow.n = i;
    textGlow.onDraw = function () {
      this.animate().alpha(1).duration(600).delay(this.n * 100).onEnd = function () {
        this.animate().alpha(0).duration(600);
      }
      return 1
    }

    ButtonColors.push(b);
    DrugGlows.push(glow);
    DrugTextGlows.push(textGlow);
    Clickables.push(b);
    ButtonTexts.push(text);
    Buttons.push(t);
  }

  Close_Button = Screen.addSprite()
    .setTexture(['White_128x128.png', 'Close.png'])
    .setScale(64)
    .setTranslationX(447)
    .setTranslationY(0.5 * (1024 * sW / sH) - 35);

  Close_Button.ON = function () {
    this.animate().duration(300).onEnd = function () {
      this.setClickable(true)
    }
  }

  Close_Button.OFF = function () {
    this.setClickable(false)
  }

  Close_Button.onTouchEnd = function () {
    blipp.close()
  }

  Instructions_Button = Screen.addSprite()
    .setTexture(['Instructions_Button_OFF.png', 'Instructions_Button-A.png'])
    .setScale(64)
    .setTranslationX(-489 - 96)
    .setHotspot([0, 0.1, 0, 1.6, 1, 1])
    .setTranslationY(0.5 * (1024 * sW / sH) - 42);

  Instructions_Button.onTouchEnd = function () {
    Telemetry('Tap_Instructions_Information_main_menu');
    StartPopUp([Instructions, Instructions_Button_ON], true)
  }

  References_Button = Screen.addSprite()
    .setTexture(['References_Button_OFF.png', 'Instructions_Button-A.png'])
    .setScale(64)
    .setTranslationX(-489 - 96)
    .setHotspot([0, -0.1, 0, 1.6, 1, 1])
    .setTranslationY(0.5 * (1024 * sW / sH) - 98 - 10);

  References_Button.onTouchEnd = function () {
    Telemetry('Tap_Reference_Information_main_menu');
    StartPopUp([References, References_Button_ON], true)
  }

  Dark = Screen.addSprite().setScale(1024).setColor('000000')
    .setAlpha(0.6).setHidden(true);

  Dark.onTouchEnd = function () {
    EndPopUp(false)
  }

  Instructions = Screen.addSprite(['Instructions.png', 'Instructions-A.png'])
    .setScale(1024, 256, 1).setHidden(true);

  Instructions_Button_ON = Screen.addSprite()
    .setTexture(['Instructions_Button_ON.png', 'Instructions_Button-A.png'])
    .setScale(64)
    .setTranslation(Instructions_Button.getTranslation())
    .setHidden(true);

  References = Screen.addSprite(['References.png', 'PopUp-A.png'])
    .setScale(1024, 512, 1).setHidden(true);

  References_Button_ON = Screen.addSprite()
    .setTexture(['References_Button_ON.png', 'Instructions_Button-A.png'])
    .setScale(64)
    .setTranslation(References_Button.getTranslation())
    .setHidden(true);

  PopUp_0 = Screen.addSprite(['PopUp_0.png', 'PopUp-A.png'])
    .setScale(1024, 512, 1).setHidden(true);

  PopUp_0_Back = PopUp_0.addSprite('trans.png')
    .setScale(300 / 1024, 42 / 512, 1)
    .setTranslationX(234 / 1024)
    .setTranslationY(-83 / 512)
    .setHidden(true);

  PopUp_0_Back.onTouchEnd = function () {
    EndPopUp(true);
  }

  PopUp_1 = Screen.addSprite(['PopUp_1.png', 'PopUp-A.png'])
    .setScale(1024, 512, 1).setHidden(true);

  PopUp_1_Link = PopUp_1.addSprite('trans.png')
    .setScale(480 / 1024, 42 / 512, 1)
    .setTranslationX(140 / 1024)
    .setTranslationY(-42 / 512)
    .setHidden(true);

  PopUp_1_Back = PopUp_1.addSprite('trans.png')
    .setScale(300 / 1024, 42 / 512, 1)
    .setTranslationX(234 / 1024)
    .setTranslationY(-84 / 512)
    .setHidden(true);

  PopUp_1_Link.onTouchEnd = function () {
    Telemetry('Tap_Dr_Vivian_Fonseca_Video');
    blipp.openURL('https://www.glycemicexplorer.com/diabetes-video-library/treatment-guidelines');
  }

  PopUp_1_Back.onTouchEnd = function () {
    EndPopUp(true);
  }

  PopUp_2 = Screen.addSprite(['PopUp_2.png', 'PopUp-A.png'])
    .setScale(1024, 512, 1).setHidden(true);

  PopUp_2_Link = PopUp_2.addSprite('trans.png')
    .setScale(480 / 1024, 42 / 512, 1)
    .setTranslationX(140 / 1024)
    .setTranslationY(-42 / 512)
    .setHidden(true);

  PopUp_2_Back = PopUp_2.addSprite('trans.png')
    .setScale(300 / 1024, 42 / 512, 1)
    .setTranslationX(234 / 1024)
    .setTranslationY(-84 / 512)
    .setHidden(true);

  PopUp_2_Link.onTouchEnd = function () {
    Telemetry('Tap_Glycemic_Explorer_Web_links');
    blipp.openURL('https://www.glycemicexplorer.com/')
  }

  PopUp_2_Back.onTouchEnd = function () {
    EndPopUp(true);
  }

  PopUp_3 = Screen.addSprite(['PopUp_3.png', 'PopUp-A.png'])
    .setScale(1024, 512, 1).setHidden(true);

  PopUp_3_Link = PopUp_3.addSprite('trans.png')
    .setScale(480 / 1024, 42 / 512, 1)
    .setTranslationX(140 / 1024)
    .setTranslationY(-42 / 512)
    .setHidden(true);

  PopUp_3_Back = PopUp_3.addSprite('trans.png')
    .setScale(300 / 1024, 42 / 512, 1)
    .setTranslationX(234 / 1024)
    .setTranslationY(-84 / 512)
    .setHidden(true);

  PopUp_3_Link.onTouchEnd = function () {
    Telemetry('Show_T2DM_Uncontrolled_Information');
    blipp.openURL('https://www.glycemicexplorer.com/');
  }

  PopUp_3_Back.onTouchEnd = function () {
    EndPopUp(true);
  }

  Clickables.push(Instructions_Button);
  Clickables.push(References_Button);

  var DrugsGlowLoop = scene.animate().duration(5000).loop()

  DrugsGlowLoop.onLoop = function () {
    GlowDrugs()
  }
}
scene.onShow = function () {
  Instructions_Button.animate().duration(500).interpolator("easeOut").translationX(Instructions_Button.getTranslationX() + 96);
  References_Button.animate().duration(500).delay(200).interpolator("easeOut").translationX(References_Button.getTranslationX() + 96);
}

var StartedPopUps = false;

scene.onTouchStart = function () {
  if (Clicks < MinClicksForPopUp && Clicks != -1) {
    Clicks++;
  } else {
    if (Clicks != -1) {
      scene.animate().duration(PopUpDelay * 0.25 * 1000).onEnd = function () {
        if (!VisiblePopUp) {
          NextPopUp();
        }
      }
    }
    Clicks = -1;
  }
}

scene.onTouchMove = function () {
  blipp.goToBlipp(blipp.getAddress())
}