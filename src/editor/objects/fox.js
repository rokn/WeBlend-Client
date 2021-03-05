import {GeometryNode} from 'scene/nodes';
import {vec3} from 'gl-matrix';

export function createFox(parent, options = {
    name:"Fox",
    initialPosition: vec3.create()
}) {
    const faces = [31,94,145,117,14,37,18,38,120,20,18,19,14,25,18,36,24,25,234,232,67,15,16,26,122,37,20,122,20,130,113,36,117,4,34,145,32,263,270,270,138,32,31,281,280,280,94,31,31,34,42,231,227,70,88,200,90,87,88,90,203,86,89,86,87,90,264,267,30,34,31,145,109,35,10,117,36,14,122,117,37,19,18,120,20,37,18,130,20,19,37,14,18,283,10,285,14,36,25,32,138,46,109,95,35,6,4,145,264,263,32,46,138,281,232,35,231,207,203,89,90,200,206,89,86,90,206,207,89,90,206,89,140,145,94,10,283,286,286,109,10,117,150,114,119,120,151,123,121,119,114,119,129,148,129,128,230,180,236,115,131,116,122,123,150,122,130,123,113,117,148,97,145,144,138,270,265,265,142,138,94,280,279,279,140,94,140,155,144,226,183,235,204,208,200,202,208,204,203,205,201,201,208,202,271,139,268,144,145,140,109,106,147,117,114,148,122,150,117,121,120,119,123,119,150,130,121,123,150,119,114,288,290,106,114,129,148,142,159,138,109,147,95,100,145,97,271,142,265,159,140,279,236,226,147,207,205,203,208,206,200,205,208,201,206,205,207,208,205,206,106,109,286,286,288,106,232,234,10,10,35,232,231,70,67,67,232,231,236,147,106,106,230,236,227,231,35,35,95,227,235,95,147,147,226,235,226,236,180,180,183,226,268,126,142,142,271,268,95,265,270,265,95,139,139,271,265,267,264,32,32,22,267,95,270,263,263,264,30,30,95,263,138,280,281,138,279,280,138,159,279,31,46,281,290,288,148,148,128,290,288,286,113,113,148,288,285,24,36,36,283,285,283,36,113,113,286,283,6,145,132,27,6,132,30,267,273,273,21,30,137,275,274,274,29,137,33,5,28,29,3,5,5,4,6,30,21,63,9,105,108,8,9,11,13,11,12,24,13,16,12,112,149,11,108,112,25,16,18,13,12,26,16,15,17,38,124,120,18,17,38,285,289,24,16,13,26,12,15,26,28,6,27,3,22,45,27,132,85,15,149,17,1,141,146,93,29,33,98,33,101,5,3,2,22,32,40,4,5,41,34,4,44,245,253,52,50,54,254,40,46,54,251,247,48,246,248,50,45,40,49,2,45,49,254,246,50,63,66,7,70,64,69,106,127,225,225,229,106,95,30,64,64,63,69,135,39,260,27,83,258,134,152,257,257,259,134,84,83,87,85,196,200,83,85,88,82,84,86,203,82,86,40,32,46,137,29,93,39,33,28,101,33,39,33,29,5,9,146,105,28,5,6,11,9,108,287,8,11,64,30,63,25,24,16,12,11,112,17,149,124,18,16,17,38,17,124,63,21,66,228,10,234,273,269,21,135,101,39,2,3,45,83,27,85,15,12,149,241,1,146,98,93,33,41,5,2,274,272,29,45,22,40,44,4,41,42,34,44,54,46,254,227,95,64,7,66,68,82,135,84,85,132,196,203,135,82,84,135,260,86,84,87,88,85,200,87,83,88,100,132,145,133,132,100,125,261,268,268,139,125,136,276,275,275,137,136,237,240,127,127,103,237,143,134,99,136,99,96,99,100,97,139,176,125,104,108,105,103,107,104,111,110,107,8,287,289,289,23,8,128,116,111,110,149,112,107,112,108,129,119,116,111,131,110,116,118,115,151,120,124,119,151,118,290,128,282,116,131,111,110,131,115,134,133,100,96,158,126,133,199,132,115,118,149,91,146,141,93,143,136,98,101,143,99,92,96,126,153,142,97,154,99,144,157,97,249,165,244,153,167,159,250,161,243,255,163,252,158,162,153,92,162,158,256,163,255,176,102,179,183,182,177,95,177,139,177,182,176,135,198,257,259,197,133,258,83,84,84,260,258,198,202,197,199,200,196,197,204,199,195,201,198,203,201,195,153,159,142,137,93,136,152,134,143,101,152,143,143,99,136,104,105,146,134,100,99,107,108,104,107,103,284,177,176,139,129,116,128,110,112,107,118,124,149,119,118,116,151,124,118,176,179,125,229,230,106,261,125,266,135,152,101,92,158,96,197,199,133,115,149,110,146,91,238,98,143,93,154,92,99,276,136,262,158,153,126,157,154,97,155,157,144,167,163,256,177,95,235,102,181,179,195,198,135,199,196,132,203,195,135,259,257,198,198,197,259,201,202,198,204,200,199,202,204,197,246,254,46,46,31,246,91,262,278,278,210,91,21,269,277,277,209,21,125,179,240,210,278,266,266,125,210,1,209,277,277,272,1,10,228,233,233,23,10,179,181,225,230,229,185,185,180,230,234,67,72,72,228,234,228,72,68,68,233,228,229,225,181,181,185,229,70,227,64,183,177,235,66,233,68,233,66,242,242,23,233,239,8,23,23,242,239,242,21,209,209,239,242,241,239,209,209,1,241,238,237,103,103,104,238,127,240,179,179,225,127,21,242,66,238,91,210,210,237,238,104,146,238,9,241,146,241,9,8,8,239,241,237,210,125,125,240,237,247,251,42,42,44,247,248,246,31,31,42,248,253,245,44,44,41,253,244,154,157,157,249,244,243,157,155,155,250,243,154,156,92,41,2,43,255,140,159,159,256,255,252,155,140,140,255,252,159,167,256,28,258,260,260,39,28,152,135,257,134,259,133,28,27,258,141,275,276,141,274,275,272,274,141,141,1,272,272,277,3,3,29,272,269,273,22,22,3,269,3,277,269,22,273,267,96,266,278,262,91,141,141,276,262,262,136,96,96,278,262,126,268,261,266,96,126,126,261,266,103,127,282,282,284,103,287,13,24,24,289,287,289,285,10,10,23,289,282,127,106,106,290,282,284,282,128,128,111,284,13,287,11,111,107,284,43,49,53,54,50,59,43,53,47,57,47,51,50,48,57,53,54,58,52,43,47,48,52,47,61,59,62,61,62,55,57,51,55,51,47,60,47,56,60,56,58,61,69,7,65,69,77,214,221,217,75,215,212,73,212,218,73,7,68,222,80,73,78,78,74,81,73,77,78,77,71,74,76,75,79,75,73,80,71,76,81,247,44,245,49,40,54,248,42,251,53,49,54,43,2,49,58,54,59,47,53,56,59,50,57,56,53,58,57,48,47,62,59,57,60,61,55,57,55,62,55,51,60,61,58,59,60,56,61,69,63,7,65,7,71,218,70,214,222,68,221,217,72,215,77,69,65,71,7,76,74,71,81,77,65,71,80,78,79,79,78,81,78,77,74,81,76,79,79,75,80,156,166,162,167,172,163,156,160,166,170,164,160,163,170,161,166,171,167,165,160,156,161,160,165,174,175,172,174,168,175,170,168,164,164,173,160,160,173,169,169,174,171,182,178,102,223,190,182,211,188,219,224,186,213,213,186,220,102,189,216,193,191,186,191,194,187,186,191,190,190,187,184,189,192,188,188,193,186,184,194,189,243,249,157,162,167,153,252,250,155,166,167,162,156,162,92,171,172,167,160,169,166,172,170,163,169,171,166,170,160,161,175,170,172,173,168,174,170,175,168,168,173,164,174,172,171,173,174,169,182,102,176,178,184,102,220,223,183,216,211,181,219,224,185,190,178,182,184,189,102,187,194,184,190,184,178,193,192,191,192,194,191,191,187,190,194,192,189,192,193,188,221,75,76,76,222,221,223,220,186,186,190,223,224,219,188,188,186,224,217,221,68,68,72,217,215,73,75,75,217,215,214,77,73,73,218,214,213,180,185,185,224,213,220,183,180,180,213,220,212,215,72,72,67,212,218,212,67,67,70,218,219,185,181,181,211,219,211,216,189,189,188,211,76,7,222,70,69,214,183,223,182,181,102,216,250,252,163,163,161,250,251,48,50,50,248,251,245,52,48,48,247,245,249,243,161,161,165,249,244,156,154,165,156,244,253,41,43,52,253,43,19,120,130,121,130,120];
    const vertices = [10.013863,57.761101,8.092894,11.597156,30.546070,-26.744658,11.532140,49.646450,-24.654264,7.041744,42.900967,-37.667263,10.698391,49.273220,-37.793137,4.212160,43.850330,-40.912064,9.038975,16.989401,15.505488,11.207468,53.822937,21.917948,10.067627,60.659023,22.694967,6.766037,37.404408,27.425133,7.787885,66.506470,32.700138,4.684775,72.120506,41.261551,10.391252,64.281273,40.747532,6.704249,53.417492,52.455326,4.759357,69.991417,51.111191,9.525023,66.221077,48.920918,2.446671,62.239990,57.674969,5.348628,57.736511,58.438560,1.544795,55.042629,66.616386,3.744807,52.667049,61.826649,10.111939,35.768944,10.992324,9.993451,37.712261,-16.556917,10.013863,42.553417,26.717955,9.988014,56.955791,42.201694,10.013863,58.609661,51.223545,12.592718,78.907196,50.617199,5.973053,34.281334,-44.943275,7.032498,48.605991,-40.948818,9.982605,58.756222,-24.037142,5.027300,32.852188,11.318334,2.056373,35.214417,-23.045122,6.829890,34.808849,-16.536997,9.327534,56.691536,-37.719746,3.520886,42.379272,-37.013641,2.183788,35.781075,24.601305,8.293067,52.386982,43.218887,4.904160,52.507389,57.364223,3.009861,59.059044,61.444351,5.543530,52.101986,-41.486565,7.071897,32.333771,-16.991381,9.109836,27.907665,-34.265007,4.500137,27.594797,-34.178272,9.183167,17.618965,-36.244965,6.974576,28.072906,-36.530643,9.315205,32.477558,-18.120550,3.702704,34.358364,-16.706863,9.331923,7.311107,-34.947582,7.013714,16.314199,-40.327499,7.778813,20.654619,-30.463177,4.783840,15.923059,-38.308228,9.366554,3.212086,-32.988701,8.628613,15.798697,-38.807072,7.649887,16.026573,-33.310181,4.976735,17.745190,-33.997730,9.313169,-0.102413,-31.925713,6.951199,6.461366,-32.434643,6.932008,0.104527,-34.389244,5.151371,6.549992,-33.481785,4.537588,4.365971,-33.920586,7.941847,0.282303,-27.764814,5.585605,0.235170,-27.750130,4.476759,-0.121749,-31.956766,9.328464,27.981525,13.414048,4.493071,28.916027,13.392735,8.002938,7.590978,15.186169,10.433646,28.916027,16.023142,4.500369,27.181681,20.904129,9.233382,24.872164,19.955320,5.920657,17.709198,14.549994,3.621434,25.564863,16.400618,8.838432,5.132270,16.926331,7.118914,26.678217,22.674995,4.654186,6.348670,17.741123,8.701713,-0.044660,17.206516,6.961725,5.765913,20.814400,8.523355,5.926096,18.672106,5.668706,5.087811,16.250120,4.907765,-0.059867,17.182732,7.095158,0.225407,25.209337,5.185275,0.797058,23.492233,8.421673,0.566217,23.332426,5.704151,37.406715,-66.230438,8.622420,25.133497,-59.199596,7.795183,34.607143,-64.652672,6.508358,21.221992,-56.929855,4.769795,23.995514,-78.082939,6.403100,17.834827,-72.839455,3.900368,15.183629,-69.952042,2.598336,18.470301,-87.441994,2.936006,14.774080,-86.007751,-10.013863,57.761101,8.092894,-11.597156,30.546070,-26.744658,0.000000,64.694885,-25.604443,0.000000,35.722736,-25.604439,0.000000,32.053509,15.642671,-11.532140,49.646450,-24.654264,-7.041744,42.900967,-37.667263,0.000000,61.317280,-37.667263,-10.698361,49.273220,-37.793137,-4.412906,43.850330,-40.912064,-0.100373,56.235497,-40.874062,-9.038975,16.989401,15.505488,-11.207468,53.822937,21.917948,-10.067656,60.659023,22.694967,0.000000,66.905251,22.630356,-6.766067,37.404408,27.425133,-7.787885,66.506470,32.700138,0.000000,71.519196,32.146744,0.000000,36.583881,28.002483,-4.684804,72.120506,41.261551,-10.391252,64.281273,40.747532,0.000000,73.626488,41.172459,0.000000,48.425144,43.116306,-6.704249,53.417492,52.455326,-4.759357,69.991417,51.111191,-9.525023,66.221077,48.920918,0.000000,51.896893,52.404381,-2.446671,62.239990,57.674969,-5.348628,57.736511,58.438560,0.000000,56.019730,66.624329,-1.544824,55.042629,66.616386,0.000000,50.609543,59.065018,-3.744837,52.667049,61.826649,0.000000,61.559505,58.601181,-10.111939,35.768944,10.992324,-9.993451,37.712261,-16.556917,-10.013863,42.553417,26.717955,-9.988014,56.955791,42.201694,-10.013863,58.609661,51.223545,0.000000,53.720505,66.624855,-12.592718,78.907196,50.617199,0.000000,32.943771,-43.742401,-5.973024,34.281334,-44.943275,-7.233244,48.605991,-40.948818,0.000000,51.503872,-48.483589,-9.982605,58.756222,-24.037142,0.000000,65.034004,-14.840280,0.000000,32.890743,-11.251088,-5.027300,32.852188,11.318334,-2.056373,35.214417,-23.045122,0.000000,64.057281,8.092893,-6.829890,34.808849,-16.536997,-9.327534,56.691536,-37.719746,-3.520857,42.379272,-37.013641,-0.100373,42.954819,-40.809715,0.000000,66.228600,16.033606,-2.183788,35.781075,24.601305,-8.293067,52.386982,43.218887,0.000000,71.232178,51.185360,-4.904160,52.507389,57.364223,-3.009861,59.059044,61.444351,-5.744277,52.101986,-41.486565,-7.071897,32.333771,-16.991381,-9.109836,27.907665,-34.265007,-4.500137,27.594797,-34.178272,-9.183167,17.618965,-36.244965,-6.974547,28.072906,-36.530643,-9.315205,32.477558,-18.120550,-3.702704,34.358364,-16.706863,-9.331895,7.311107,-34.947582,-7.013685,16.314199,-40.327499,-7.778813,20.654619,-30.463177,-4.783840,15.923059,-38.308228,-9.366526,3.212086,-32.988701,-8.628613,15.798697,-38.807072,-7.649887,16.026573,-33.310181,-4.976707,17.745190,-33.997730,-9.313140,-0.102413,-31.925713,-6.951199,6.461366,-32.434643,-6.932008,0.104527,-34.389244,-5.151371,6.549992,-33.481785,-4.537588,4.365971,-33.920586,-7.941847,0.282303,-27.764814,-5.585605,0.235170,-27.750130,-4.476759,-0.121749,-31.956766,-9.328464,27.981525,13.414048,-4.493071,28.916027,13.392735,-8.002967,7.590978,15.186169,-10.433646,28.916027,16.023142,-4.500369,27.181681,20.904129,-9.233382,24.872164,19.955320,-5.920657,17.709198,14.549994,-3.621434,25.564863,16.400618,-8.838432,5.132270,16.926331,-7.118914,26.678217,22.674995,-4.654215,6.348670,17.741123,-8.701713,-0.044660,17.206516,-6.961725,5.765913,20.814400,-8.523355,5.926096,18.672106,-5.668736,5.087811,16.250120,-4.907765,-0.059867,17.182732,-7.095158,0.225407,25.209337,-5.185275,0.797058,23.492233,-8.421673,0.566217,23.332426,-5.704151,37.406715,-66.230438,0.000000,20.149696,-56.504898,-8.622420,25.133497,-59.199596,-7.795183,34.607143,-64.652672,-6.508358,21.221992,-56.929855,0.000000,14.296408,-69.414406,-4.769795,23.995514,-78.082939,-6.403071,17.834827,-72.839455,0.000000,38.177895,-68.047012,-3.900368,15.183629,-69.952042,-2.598307,18.470301,-87.441994,0.000000,13.995141,-85.688431,0.000000,20.144981,-88.095001,-2.936006,14.774080,-86.007751,11.299932,52.633427,8.653613,-11.299932,52.633427,8.653613,-8.267072,16.744806,20.320761,4.574748,17.109808,19.374949,-4.574748,17.109808,19.374949,4.424944,17.528223,16.341564,5.943046,16.979311,20.321110,-8.933396,16.867134,19.413126,7.044477,16.776154,21.793997,4.057994,17.441895,16.967270,-7.044477,16.776154,21.793997,-4.057994,17.441925,16.967270,8.267072,16.744806,20.320761,8.933396,16.867134,19.413126,-4.424944,17.528223,16.341564,-5.943046,16.979311,20.321110,-9.442619,29.611984,21.768175,-3.086478,29.366341,19.452118,1.704136,29.000147,15.999357,7.014325,29.857479,24.082954,-7.014325,29.857479,24.082954,-5.056290,29.690054,22.504198,3.086478,29.366341,19.452118,3.840238,29.632074,21.957642,9.442591,29.611984,21.768175,5.056290,29.690054,22.504198,-1.704136,29.000147,15.999357,-3.840238,29.632074,21.957642,-11.253933,53.225349,15.254115,-10.040555,59.199276,15.339456,11.253933,53.225349,15.254115,-10.086759,37.510738,15.029643,10.040555,59.199276,15.339456,10.086759,37.510738,15.029615,-7.001473,19.988350,-39.141106,-8.753324,18.937077,-37.629868,8.156289,19.303762,-38.157001,4.432271,18.409653,-36.340858,7.001473,19.988350,-39.141106,4.715858,18.720396,-37.318424,-8.156260,19.303762,-38.157001,-6.286764,19.576534,-38.549133,6.286793,19.576534,-38.549133,-4.715858,18.720396,-37.318424,8.753352,18.937048,-37.629868,4.649679,18.210796,-35.627605,-4.432271,18.409653,-36.340858,-4.649679,18.210796,-35.627605,-6.470122,45.910332,-49.685364,7.595193,40.298759,-47.408001,-7.724875,40.298759,-47.408001,6.340411,45.910332,-49.685364,-10.021249,37.256516,-10.095922,-9.995225,58.354156,-11.054910,5.433794,34.245609,-9.959058,6.404525,34.347115,-9.963682,-5.433765,34.245609,-9.959058,-10.964531,44.099869,-10.406987,8.836920,36.580421,-10.065188,-8.836920,36.580421,-10.065188,10.964531,44.099869,-10.406987,0.000000,32.848553,-9.895555,-6.404525,34.347115,-9.963682,9.995225,58.354156,-11.054910,10.021249,37.256516,-10.095922,5.984772,60.879215,-11.169677,0.000000,64.885422,-11.351786,-5.984772,60.879215,-11.169677,11.434965,50.896404,-10.715930,-11.434965,50.896404,-10.715930,-0.940462,33.953442,-16.644930,0.000000,33.955036,-16.645161,0.940462,33.953442,-16.644899,-9.998714,51.307644,35.496368,7.016389,46.160694,36.028797,-10.693941,60.403057,33.765018,8.642366,49.095310,35.725204,0.000000,43.622169,36.291420,10.693913,60.403057,33.765018,-7.016389,46.160694,36.028797,9.998714,51.307644,35.496368,-8.642366,49.095310,35.725204];

    const fox = new GeometryNode(options.name, parent);
    fox.setMeshDataNew(vertices, faces.map(f => f-1));
    fox.transform.setPosition(options.initialPosition);
    fox.transform.setRotation([90,0,0]);
    fox.transform.setScale([0.01,0.01,0.01]);
    return fox;
}
