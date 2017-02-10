var blipp = require('blippar').blipp;
scene = blipp.addScene();

// Global variables
var mW = blipp.getMarker().getWidth();
var mH = blipp.getMarker().getHeight();
var sW = blipp.getScreenWidth() * 1.003;
var sH = blipp.getScreenHeight() * 1.003; 

var DrugsHeight = 53;
var DrugsY = -256;
var DrugsDefaultColor = 'ffffff';
var DrugsTextColor = ['4da6d2','ffffff'];

var Drugs = [	['DPP-4i', 			133,-445, '007eff', [0,1,3]],
							['GLP-1 RA', 		133,-308, '00c124', [0,1,2,3,5]],
							['Insulin',			133,-171, 'b3a7a2', [1,3,4,7]],
							['Metformin',		133, -34, '00b1b1', [3]],
							['SGLT-2i',			133, 103, 'ffd100', [6]],
							['Sulfonylurea',133, 240, 'ff5e37', [0]],
							['TZD', 				133, 377, 'fc72a8', [3,4,7]],
							['ALL', 		 		 64, 480, '4da6d2']
						];

var Organs = [['PANCREAS', 				[-339,  38], [ -74, 63]],
							['alpha-ISLET CELL',[-263,-113], [-103,-39]],
							['GI TRACT',				[-202, 125], [ -72, 64]],
							['LIVER',						[ -76, -55], [ -58, 63]],
							['ADIPOSE CELL',		[  43,  63], [  91, 64]],
							['BRAIN',						[ 127,-100], [  81,-35]],
							['KIDNEY',				 	[ 300, 144], [  67, 66]],
							['MUSCLE',				 	[ 311, -36], [  91,-35]]
			  		];

var Buttons = [];
var ButtonTexts = [];
var ButtonColors = [];

var Icons = [];
var IconSegments = [];
var IconOrgans = [];
var IconGlows = [];

var Clickables = [];

var OrganWobbleRadius = 4;

function SetOrgans(){
	for (var i = 0; i < Organs.length; i++) {
		for (var j = 0; j < Drugs.length-1; j++) {			
			IconSegments[i][j].setColor(DrugsTextColor[1]).setAlpha(0.3);
		}
		IconOrgans[i].setColor(DrugsTextColor[1]).setAlpha(0.75);
		IconGlows[i].setAlpha(0);
	}

	for (var i = 0; i < Drugs.length-1; i++) {
		if(ButtonColors[i].isSelected){
			for (var j = 0; j < Drugs[i][4].length; j++) {
				var n = Drugs[i][4][j];
				IconSegments[n][i].setColor(Drugs[i][3]).setAlpha(1);
				IconOrgans[n].setColor(DrugsTextColor[0]).setAlpha(1);
				IconGlows[n].setAlpha(1);
			}
		}
	}
}

var CurrentPopUps;

function StartPopUp(popups,closeDark){
	CurrentPopUps = popups;
	Dark.setHidden(false);
	Dark.setClickable(closeDark);
	for(i = 0; i < CurrentPopUps.length; i++){
		CurrentPopUps[i].setHidden(false);
	}
	for(i = 0; i < Clickables.length; i++){
		Clickables[i].setClickable(false);
	}
	blipp.hideUiComponents('peelCloseButton')
}

function StartPopUp_0(){
	StartPopUp([PopUp_0,PopUp_0_Back],false)
}

function StartPopUp_1(){
	StartPopUp([PopUp_1,PopUp_1_Back,PopUp_1_Link],false)
}

function StartPopUp_2(){
	StartPopUp([PopUp_2,PopUp_2_Back,PopUp_2_Link],false)
}

function StartPopUp_3(){
	StartPopUp([PopUp_3,PopUp_3_Back,PopUp_3_Link],false)
}

function EndPopUp(){
	blipp.showUiComponents('peelCloseButton')
	Dark.setHidden(true);
	for(i = 0; i < CurrentPopUps.length; i++){
		CurrentPopUps[i].setHidden(true);
	}
	for(i = 0; i < Clickables.length; i++){
		Clickables[i].setClickable(true);
	}
}

scene.onCreate = function() {

	blipp.hideUiComponents('navbar')

	Screen = scene.getScreen().addTransform().setRotationZ(-90).setScale(sH/1024);

	Background = Screen.addSprite('Background.jpg').setScale(1024);

	Pulse = Screen.addSprite('trans.png');

	Pulse.onDraw = function(){
		this.animate().scale(0.95).duration(400).interpolator('easeInOut').onEnd = function(){
			this.animate().scale(1).duration(400).interpolator('easeInOut').onEnd = function(){
				this.onDraw();
			}
		}
		return 1
	}

	//Pulse_show = Pulse.addSprite().setColor('ff000080').setScale(256).setCornerRadius(128);

	Logo = Screen.addSprite(['Logo.png','Logo-A.jpg']).setScale(512).setTranslationY(210);

	DrugClasses = Screen.addSprite(['DrugClasses.png','DrugClasses-A.png'])
								.setScale(1024,32,1).setTranslationY(-213);

	for (var i = 0; i < Organs.length; i++) {
		var t =  Screen.addTransform()
				.setTranslationX(Organs[i][1][0])
				.setTranslationY(Organs[i][1][1]);	

				t_pivot = t.addSprite('trans.png');
				t_pivot.n = i;

				t_pivot.onUpdate = function(){
					if(IconGlows[this.n].getAlpha() != 0) {
						this.setTranslationX(0);
						this.setTranslationY(0);
						this.setScale(Pulse.getScale()[0]);
					} else {
						this.setTranslationX(OrganWobbleRadius*(Math.random() - 0.5));
						this.setTranslationY(OrganWobbleRadius*(Math.random() - 0.5));
					}
				}

				g = t_pivot.addSprite(['White_256x256.png', 'OrganGlow.jpg']).setScale(256).setAlpha(0)

				o = t_pivot.addSprite(['White_128x128.png', 'Organ' + i + '.png'])
							.setAlpha(0.75).setScale(128)	

				name = t.addSprite(['Organ' + i + '_name.png', 'Organ' + i + '_name-A.png'])
							.setScale([128,32,1])
							.setTranslationX(Organs[i][2][0])
							.setTranslationY(Organs[i][2][1]);

		var segs = [];

				for (var j = 0; j < Drugs.length-1; j++) {
					var s = t_pivot.addSprite(['White_128x128.png', 'OrganSegment.png'])
							 		 .setAlpha(0.3).setScale(128).setRotationZ(-j*360/(Drugs.length-1));
							s.Color = Drugs[j][3];
					segs.push(s);
				}

		IconSegments.push(segs);
		IconOrgans.push(o);
		IconGlows.push(g);
		Icons.push(t);
	}

	for (var i = 0; i < Drugs.length; i++) {
		var t = Screen.addTransform()
				.setTranslationX(Drugs[i][2])
				.setTranslationY(DrugsY);

			b = t.addSprite()
				.setScale(Drugs[i][1], DrugsHeight, 1)
				.setColor(DrugsDefaultColor);
			b.n = i;
			b.isSelected = false;
			b.onTouchEnd = function(){
				this.isSelected = !this.isSelected;

				if(this.n == 7){
					for (var i = 0; i < Drugs.length; i++) {
						if(this.isSelected) {
							ButtonColors[i].isSelected = true;
							ButtonColors[i].setColor(Drugs[i][3])
							ButtonTexts[i].setActiveTexture(1).setColor(DrugsTextColor[1])
						} else {				
							ButtonColors[i].isSelected = false;
							ButtonColors[i].setColor(DrugsDefaultColor)
							ButtonTexts[i].setActiveTexture(0).setColor(DrugsTextColor[0])
						}
					}
				}

				if(this.isSelected){
					this.setColor(Drugs[this.n][3])
					ButtonTexts[this.n].setActiveTexture(1).setColor(DrugsTextColor[1])
				} else {
					this.setColor(DrugsDefaultColor)
					ButtonTexts[this.n].setActiveTexture(0).setColor(DrugsTextColor[0])

					if(ButtonColors[Drugs.length-1].isSelected){					
						ButtonColors[Drugs.length-1].isSelected = false;
						ButtonColors[Drugs.length-1].setColor(DrugsDefaultColor)
						ButtonTexts[Drugs.length-1].setActiveTexture(0).setColor(DrugsTextColor[0])
					}
				}

				SetOrgans()
			}

			text = t.addSprite()
				.setScale(128,32,1)
				.setTextures([	['White_128x32.png', 'Drug' + i + '.png'],
								['White_128x32.png', 'Drug' + i + 's.png']])
				.setTexturesPreload(true)
				.setActiveTexture(0)
				.setColor(DrugsTextColor[0]);

		ButtonColors.push(b)
		Clickables.push(b)
		ButtonTexts.push(text)
		Buttons.push(t)
	}

	Instructions_Button = Screen.addSprite()
												.setTexture(['Instructions_Button_OFF.png','Instructions_Button-A.png'])
												.setScale(64)
												.setTranslationX(-489)
												.setTranslationY(246 - 64);

	Instructions_Button.onTouchEnd = function(){
		StartPopUp([Instructions,Instructions_Button_ON],true)
	}

	References_Button = Screen.addSprite()
												.setTexture(['References_Button_OFF.png','Instructions_Button-A.png'])
												.setScale(64)
												.setTranslationX(-489)
												.setTranslationY(190 - 64);

	References_Button.onTouchEnd = function(){
		StartPopUp([References,References_Button_ON],true)
	}

	Dark = Screen.addSprite().setScale(1024).setColor('000000')
				.setAlpha(0.6).setHidden(true);

	Dark.onTouchEnd = function(){
		EndPopUp()
	}

	Instructions = Screen.addSprite(['Instructions.png','Instructions-A.png'])
									.setScale(1024,256,1).setHidden(true);

	Instructions_Button_ON = Screen.addSprite()
												.setTexture(['Instructions_Button_ON.png','Instructions_Button-A.png'])
												.setScale(64)
												.setTranslationX(-489)
												.setTranslationY(246 - 64)
												.setHidden(true);

	References = Screen.addSprite(['References.png','PopUp-A.png'])
									.setScale(1024,512,1).setHidden(true);

	References_Button_ON = Screen.addSprite()
												.setTexture(['References_Button_ON.png','Instructions_Button-A.png'])
												.setScale(64)
												.setTranslationX(-489)
												.setTranslationY(190 - 64)
												.setHidden(true);

	PopUp_0 = Screen.addSprite(['PopUp_0.png','PopUp-A.png'])
									.setScale(1024,512,1).setHidden(true);

	PopUp_0_Back = PopUp_0.addSprite('trans.png')
									.setScale(300/1024,42/512,1)
									.setTranslationX(234/1024)
									.setTranslationY(-83/512)
									.setHidden(true);

	PopUp_0_Back.onTouchEnd = function(){
		EndPopUp();
	}

	PopUp_1 = Screen.addSprite(['PopUp_1.png','PopUp-A.png'])
									.setScale(1024,512,1).setHidden(true);

	PopUp_1_Link = PopUp_1.addSprite('trans.png')
									.setScale(480/1024,42/512,1)
									.setTranslationX(140/1024)
									.setTranslationY(-42/512)
									.setHidden(true);

	PopUp_1_Back = PopUp_1.addSprite('trans.png')
									.setScale(300/1024,42/512,1)
									.setTranslationX(234/1024)
									.setTranslationY(-84/512)
									.setHidden(true);

	PopUp_1_Link.onTouchEnd = function(){
		blipp.openURL('https://www.youtube.com/watch?v=wty7Tz0Nx34'); // !!! Replace video  link
	}

	PopUp_1_Back.onTouchEnd = function(){
		EndPopUp();
	}

	PopUp_2 = Screen.addSprite(['PopUp_2.png','PopUp-A.png'])
									.setScale(1024,512,1).setHidden(true);

	PopUp_2_Link = PopUp_2.addSprite('trans.png')
									.setScale(480/1024,42/512,1)
									.setTranslationX(140/1024)
									.setTranslationY(-42/512)
									.setHidden(true);

	PopUp_2_Back = PopUp_2.addSprite('trans.png')
									.setScale(300/1024,42/512,1)
									.setTranslationX(234/1024)
									.setTranslationY(-84/512)
									.setHidden(true);

	PopUp_2_Link.onTouchEnd = function(){
		blipp.openURL('https://www.glycemicexplorer.com/')
	}

	PopUp_2_Back.onTouchEnd = function(){
		EndPopUp();
	}

	PopUp_3 = Screen.addSprite(['PopUp_3.png','PopUp-A.png'])
									.setScale(1024,512,1).setHidden(true);

	PopUp_3_Link = PopUp_3.addSprite('trans.png')
									.setScale(480/1024,42/512,1)
									.setTranslationX(140/1024)
									.setTranslationY(-42/512)
									.setHidden(true);

	PopUp_3_Back = PopUp_3.addSprite('trans.png')
									.setScale(300/1024,42/512,1)
									.setTranslationX(234/1024)
									.setTranslationY(-84/512)
									.setHidden(true);

	PopUp_3_Link.onTouchEnd = function(){
		blipp.openURL('https://www.glycemicexplorer.com/')
	}

	PopUp_3_Back.onTouchEnd = function(){
		EndPopUp();
	}

	Clickables.push(Instructions_Button);
	Clickables.push(References_Button);
}

//scene.onTouchMove = function (){ blipp.goToBlipp(blipp.getAddress()) }