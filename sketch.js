var root;
var pointP = [17.6237794832,108.9612413068];
var data=[];
var arra=[];
//}


function setup () {
    var width = 900;
    var height = 250;
    let kdTreeCanvas = createCanvas (width , height ) ;
    kdTreeCanvas.parent("KdTreeCanvas");

    background (0) ;

 ///////punto prueba   
    fill(254, 255, 51);
    circle(pointP[0],height-pointP[1],20);
    textSize(11);
    text(pointP[0]+ ',' + pointP[1], 140+ 5, height - 90);
////////punto prueba end

    for (var x = 200; x < width; x += width / 10) {
        for (var y = 200; y < height; y += height / 5) {
            stroke (125 , 125 , 51) ;
            strokeWeight (0.1) ;
            line (x, 0, x, height );
            line (0 , y, width , y);
        }
    }

    var data = [];

    console.log('aqui');

    // const spawner = require('child_process').spawn;
    // const python_process = spawner('python',['./app.py', JSON.stringify('data_to_pass_in')]);
    // python_process.stdout.on('data',(datas)=>{
    //     //console.log('data recived: ',JSON.parse(datas.toString()));
    //     //console.log('data recived: ',JSON.parse(data.toString()));
    // //console.log('listo 2')
    // data = JSON.parse(datas);
    // console.log(data[1])
    // });

    data = [[24.2858,64.0451,1],[17.6415,128.9096,0],[25.3698,32.0904,1],[111.0772,134.9002,0],[189.7442,97.2487,1],[19.0219,96.0554,0],[104.3513,146.9281,1],[17.8625,107.0996,0],[568.8667,68.47,1],[19.8065,81.9475,1],[18.8948,98.7933,0],[24.2582,44.238,1],[21.2834,68.8745,0],[867.4743,104.2665,1],[198.7578,62.429,1],[16.3172,121.5715,1],[250.9398,116.1928,1],[18.1906,104.4247,1],[102.0246,123.8289,0],[116.1488,107.7955,1],[256.3043,108.7787,0],[17.5801,107.8317,0],[27.2607,13.7487,1],[21.5821,94.1952,1],[169.0515,79.0902,1],[135.6535,98.3395,1],[22.2298,63.111,1],[156.9847,131.1025,0],[132.2237,74.4292,0],[19.5,91.0083,0],[19.9719,99.5292,0],[268.7577,80.243,1],[70.3434,132.4976,0],[16.8893,117.3591,0],[21.5212,89.1383,0],[210.1766,130.4352,0],[21.2826,73.1896,0],[19.9707,108.8393,1],[19.128,124.5029,1],[227.0018,119.3377,1],[96.2936,43.5363,0],[21.0214,76.3965,0],[19.3182,101.8324,0],[264.9702,57.184,1],[23.0524,54.1388,0],[27.7818,37.2624,1],[21.7359,69.482,0],[16.2648,143.0097,0],[19.748,110.8537,1],[16.4138,119.2484,0],[99.9002,117.7414,0],[53.8347,119.0351,0],[40.2551,127.8595,0],[325.1553,61.4293,1],[364.4953,96.7742,0],[15.0411,143.3178,0],[330.272,56.7426,1],[130.8738,122.4809,0],[22.2548,63.2043,0],[161.5591,124.4656,0],[14.3805,140.1981,0],[20.7173,78.1326,1],[11.7567,166.9425,0],[150.4185,89.0188,0],[18.7522,97.0624,1],[19.04,113.7046,0],[20.4644,101.27,1],[18.7873,96.2066,0],[55.3091,123.0278,0],[123.1437,76.6421,0],[108.0397,122.4171,1],[162.329,90.8068,0],[20.4487,81.3564,1],[290.0017,108.9787,0],[17.368,134.5312,0],[8.4964,214.9298,0],[13.8593,146.0697,0],[19.1209,118.5163,0],[19.5698,91.8134,1],[19.8576,103.2893,0],[19.0232,105.2982,0],[13.3988,149.7799,0],[87.9757,134.7323,0],[19.1357,114.8168,0],[21.9238,68.7368,1],[144.4481,115.5636,0],[21.3769,106.3849,0],[89.5912,120.6494,0],[132.1953,86.844,1],[19.2415,107.6451,0],[15.144,135.4077,0],[195.5795,105.0824,0],[66.0113,133.6522,0],[20.6208,74.735,1],[86.3723,78.1123,0],[249.8767,90.4413,0],[18.294,123.3378,0],[90.7358,153.1826,0],[81.8342,130.426,0],[241.792,110.5321,1],[23.7731,49.6793,1],[22.2636,65.204,0],[20.255,85.7043,0],[56.4279,136.0769,0],[16.0582,127.3005,0],[172.509,106.1552,0],[17.8121,109.3493,0],[162.2716,84.8309,0],[35.4399,134.2422,0],[54.6132,120.1563,1],[160.5782,58.0708,1],[515.8682,105.4761,1],[55.3355,128.2977,0],[15.0539,136.9744,0],[198.7756,72.9844,1],[22.2167,59.7427,1],[19.8942,86.755,1],[15.0182,137.0079,0],[18.4027,118.8659,0],[68.9518,119.3896,0],[126.6824,63.264,1],[20.8813,105.0061,0],[119.4186,116.6768,0],[20.5612,74.1261,0],[18.9042,99.4138,1],[116.8798,140.5814,1],[155.488,106.4773,0],[114.6406,108.0694,0],[164.902,106.47,1],[18.036,100.8428,1],[192.2754,57.3185,1],[19.4093,91.896,1],[249.9701,68.0287,1],[17.9153,127.0326,0],[66.3789,122.5792,0],[160.0448,103.2402,0],[68.743,119.5439,0],[109.5142,131.6433,0],[20.4824,82.5555,0],[342.6021,139.2151,0],[20.1119,80.574,0],[20.1615,104.6034,0],[82.1623,115.2857,0],[18.1537,102.8463,1],[306.6004,90.1489,0],[18.7497,113.4319,0],[15.6491,152.7331,0],[138.2506,119.7582,0],[22.1072,60.0636,0],[17.5056,123.993,0],[226.8054,99.186,0],[18.6068,98.492,0],[178.833,69.5635,1],[507.2236,107.6411,0],[26.3893,22.5458,1],[25.7588,59.5761,1],[111.2932,126.8435,0],[153.4211,120.4949,0],[70.1546,130.4208,0],[139.4229,60.4254,1],[25.0497,60.946,0],[124.4644,119.2236,0],[304.3065,125.7448,0],[18.7891,115.4968,0],[20.8023,79.0296,1],[173.8869,121.7513,1],[23.6713,68.3696,0],[19.3607,92.2918,0],[18.4003,102.8904,0],[97.029,106.775,0],[17.8313,107.4159,1],[151.3595,92.406,1],[16.4623,136.6935,0],[65.6827,141.2156,0],[70.9828,143.3819,0],[156.8809,48.5733,1],[16.0879,123.6577,0],[153.3785,91.989,1],[21.9384,65.9446,0],[20.6852,79.6866,1],[16.2391,123.2073,0],[111.7798,104.9623,0],[31.802,213.416,0],[14.6182,140.2101,0],[21.4616,70.2778,0],[28.3578,20.6178,1],[519.011,78.1472,1],[80.7616,88.2057,1],[133.9769,115.2975,1],[182.4949,90.4212,1],[18.3338,104.067,0],[115.7293,99.4138,0],[23.1416,54.2677,1],[20.0165,85.2854,1],[16.8334,128.3529,0],[234.5328,75.5335,1],[17.7104,110.4331,0],[66.3996,112.9482,1],[119.3137,116.3372,1],[339.4566,98.4931,1],[19.9153,100.1668,0],[21.5209,73.2219,0],[19.3851,105.594,0],[61.9076,118.9723,0],[208.4318,124.7132,0],[20.1888,103.3203,0],[306.7772,41.7518,1],[24.0957,43.4188,1],[105.0925,127.708,0],[27.9351,28.3777,1],[16.7632,134.0115,0],[25.7845,67.6271,0],[27.4149,28.967,0],[152.179,87.9546,1],[194.5896,115.8778,1],[294.1294,88.5069,1],[148.9079,119.3572,1],[140.8543,100.7384,0],[17.368,127.0181,1],[18.6342,98.9574,1],[501.4013,86.5935,1],[23.3502,47.6857,1],[18.0898,102.6319,0],[211.9662,88.1127,0],[73.8483,119.6575,0],[49.8323,129.0607,0],[17.7528,110.5539,0],[25.6647,56.9892,1],[768.2792,89.8957,0],[74.0406,101.0743,0],[22.0473,69.348,1],[390.8082,111.618,1],[53.7974,137.3436,0],[19.6496,90.7948,0],[61.2949,144.4507,0],[24.6386,42.5995,1],[217.5599,47.3481,1],[27.3771,34.3174,1],[25.2122,48.5637,1],[17.8005,108.3095,0],[17.9644,124.3506,0],[105.9859,131.8979,0],[20.983,77.6927,1],[195.0627,113.9505,1],[216.9646,86.6051,0],[26.7484,26.2854,1],[19.5414,89.1555,0],[701.8016,112.2448,0],[421.0905,127.6839,0],[19.9764,101.1732,0],[17.7174,106.8633,0],[20.5048,82.3736,0],[72.0577,127.4607,0],[18.1061,128.2587,0],[273.0941,143.6875,1],[20.847,103.385,1],[20.6799,105.5606,0],[20.1336,100.7473,0],[399.5897,61.9315,0],[173.5586,70.2216,1],[156.341,36.3981,0],[20.3536,82.5031,1],[18.9624,119.4483,0],[22.5546,65.8953,0],[19.5879,89.9671,1],[84.7639,120.682,0],[20.1617,85.4719,1],[22.8162,88.4699,0],[17.3336,114.1862,0],[20.8058,77.6425,1],[20.2385,108.8942,1],[75.6372,114.0347,0],[19.6051,88.4204,0],[62.5593,147.3822,0],[18.0053,102.6759,0],[77.3921,120.6488,0],[19.2894,109.198,1],[134.3515,122.4392,0],[18.7205,94.2477,0],[294.7693,133.624,0],[22.0821,67.2661,1],[143.2885,94.4392,0],[175.8198,91.731,0],[23.6197,47.9436,1],[18.2838,99.8929,1],[156.5547,87.8829,0],[567.0856,109.6632,0],[240.6551,113.7945,1],[66.4204,124.4824,0],[95.4395,112.7879,0],[57.2173,137.3186,0],[93.4443,115.536,1],[203.5058,102.2732,1],[215.4138,109.2645,1],[22.8707,51.0938,0],[143.453,76.673,0],[381.7644,103.8107,1],[235.5448,107.652,0],[201.8521,126.9305,1],[18.4649,96.3287,0],[22.9243,56.7656,1],[157.6867,86.2686,1],[59.6627,138.002,0],[19.7005,92.6128,1],[22.2943,61.9975,0],[126.1771,103.5053,0],[155.7434,64.4817,1],[168.8413,92.7184,0],[200.1112,103.949,1],[225.106,109.8657,1],[17.1619,132.3322,0],[167.44,123.0766,0],[119.2395,68.6424,1],[103.4409,111.5622,0],[20.4122,101.4437,1],[113.3626,111.1928,0],[81.5989,118.765,0],[25.5544,31.8393,1],[160.3866,113.4057,0],[26.5813,15.6615,1],[250.231,107.7502,0],[20.5599,102.1371,1],[20.9697,89.1833,1],[53.561,61.3726,1],[20.7706,102.5087,0],[191.1479,74.5239,0],[176.4593,107.8918,1],[25.2177,33.8346,0],[139.5165,121.5088,1],[87.4032,114.3552,0],[20.2423,93.2999,0],[68.6651,132.8009,0],[24.3085,42.0464,1],[18.0482,102.899,0],[75.4494,126.2796,0],[280.0394,74.379,0],[18.0043,103.349,0],[18.9855,94.5113,1],[194.5978,77.7151,1],[25.4049,32.0949,1],[125.4343,94.8982,0],[90.732,123.8293,0],[9.832,212.6165,0],[19.9187,87.6714,0],[16.9904,112.3763,0],[129.7755,93.3124,0],[104.4838,87.6878,0],[17.8306,107.6813,0],[91.7756,123.1716,0],[9.908,208.1172,1],[17.0091,117.9195,0],[21.3174,73.9801,0],[15.5425,147.3996,0],[59.7706,128.6545,0],[16.8191,121.2679,0],[24.032,43.4453,1],[187.9198,108.8303,1],[21.0603,92.8308,1],[72.3991,127.5634,0],[276.5161,43.3534,1],[350.85,59.0383,1],[23.0068,50.9684,0],[20.6113,100.465,0],[22.0722,60.5454,1],[314.6868,94.676,0],[101.2844,124.4999,0],[19.8024,88.5782,1],[18.4044,114.6316,0],[82.3682,136.6276,0],[161.9281,88.0659,1],[489.6415,86.4214,1],[108.5252,107.8589,0],[82.7982,136.9981,0],[113.6253,120.5611,0],[178.9408,110.6332,0],[346.949,100.1006,1],[101.7557,122.4896,0],[92.8906,136.14,0],[23.264,55.695,1],[91.3062,122.3715,0],[101.4698,115.271,0],[19.1462,110.3714,0],[199.3819,123.8936,0],[75.9923,130.4737,0],[130.5459,100.5236,0],[69.4221,102.5471,0],[20.8607,96.7103,1],[20.7407,102.1338,1],[306.4962,91.94,1],[99.2953,121.5006,0],[213.7949,131.0785,0],[24.2376,46.6315,1],[433.3333,124.4139,0],[106.0476,104.4719,0],[23.296,54.1881,1],[294.458,115.7123,0],[133.0092,129.7283,0],[22.9517,85.741,1],[15.5908,130.6347,0],[28.5253,23.8605,1],[16.8956,117.4652,1],[20.7559,74.0232,0],[111.1383,84.7426,1],[16.349,138.2165,0],[24.0108,45.029,1],[185.3473,110.258,0],[18.8838,94.9292,1],[17.3378,113.3288,0],[26.9118,15.957,1],[602.6424,99.6639,1],[20.4264,109.4348,0],[195.358,118.9961,0],[331.3579,99.4751,0],[83.6278,78.1755,0],[189.0935,95.4267,1],[497.6722,86.6703,1],[18.4023,117.7294,0],[23.9922,67.9786,1],[15.6129,129.8474,0],[136.1252,97.6772,1],[191.159,109.3369,0],[93.3874,127.8385,0],[98.0015,121.7974,0],[20.2109,100.8045,0],[233.2228,81.4559,1],[303.3574,57.1877,1],[15.3484,129.9609,0],[205.9007,51.6141,1],[168.2326,91.0977,0],[197.4695,131.6355,1],[16.1515,124.2922,0],[101.8104,129.9718,0],[75.8541,138.3733,0],[21.2973,73.7614,0],[16.8401,121.947,0],[20.5259,81.7087,1],[23.6634,70.8165,0],[22.1377,65.8539,0],[17.9469,117.6622,0],[18.5185,102.1291,0],[28.2574,20.4307,1],[66.8455,136.2139,0],[139.9024,109.9265,0],[18.2279,103.6743,1],[19.7158,97.3032,1],[43.5807,37.4551,1],[87.6828,119.5972,0],[111.3418,127.0911,0],[83.6458,118.1891,1],[83.1658,99.6134,0],[110.6422,141.549,0],[20.7962,80.0105,1],[227.2059,143.0771,0],[17.8971,98.1018,0],[123.3114,126.34,0],[26.4883,40.4269,1],[20.4681,75.9751,0],[88.2889,135.0358,0],[260.6805,85.1025,1],[82.1886,78.8896,0],[76.1926,96.634,0],[14.3965,142.3362,0],[66.0401,142.6203,0],[18.1733,123.3695,0],[19.264,93.0226,0],[124.5702,103.0734,0],[50.9888,145.1255,0],[118.6859,127.7793,0],[18.2499,101.2644,1],[164.6257,73.5994,0],[24.555,69.6463,0],[23.4654,79.2833,0],[21.0506,96.4506,0],[21.2205,71.2906,0],[18.7349,100.1275,0],[22.8079,71.7511,0],[210.5847,126.3959,1],[129.1008,109.0076,0],[96.7581,94.2858,0],[22.5816,75.8754,0],[350.7542,87.4375,1],[22.328,89.2066,0],[65.7713,134.5728,0],[142.2546,140.1548,0],[20.9355,77.4547,1],[271.8793,104.6851,1],[500.5145,123.8345,0],[289.9837,62.2072,0],[18.369,114.1529,0],[26.617,14.0956,0],[83.0804,137.6626,0],[18.5352,119.7844,0],[19.6635,114.8965,0],[142.0868,98.2168,1],[13.9836,143.9241,0],[23.7962,42.3304,0],[18.3441,102.7211,0],[92.0412,138.9825,0],[172.5911,31.9178,1],[216.3714,77.7687,0],[91.075,101.9789,0],[17.9777,129.0812,0],[10.2176,209.851,1],[96.7487,125.8353,0],[19.6319,115.2819,0],[15.2096,133.1835,0],[116.6446,40.4792,1],[190.4746,103.0599,0],[92.4853,140.1969,0],[19.3419,86.7934,0],[17.7301,126.6418,1],[230.6577,97.7928,0],[16.3525,117.2619,0],[16.4421,123.1721,0],[103.6245,125.5443,0],[129.0208,61.9445,1],[187.9894,79.9136,1],[20.1846,82.0503,0],[14.9296,134.8682,0],[344.5375,108.4545,0],[81.7675,152.1819,0],[151.1351,101.8864,0],[17.2889,110.2412,0],[20.3866,80.4079,1],[19.7542,90.1807,0],[17.0367,128.762,0],[99.5285,126.5045,0],[124.245,107.7128,0],[207.6909,116.7923,0],[18.3808,102.2132,0],[125.8405,104.2726,0],[18.4815,104.5497,0],[83.9023,135.0083,0],[15.4391,130.5004,0],[72.4924,144.1288,0],[19.5259,91.655,1],[18.2126,102.1617,0],[12.8495,150.5108,0],[231.1809,107.114,0],[177.6416,97.6152,1],[233.5477,131.7241,1],[210.4842,104.238,1],[18.6284,117.4207,1],[73.3756,131.5954,0],[93.6873,131.5086,0],[251.797,47.5741,1],[233.3843,43.8196,1],[186.639,99.1981,0],[93.0343,54.0321,0],[28.6429,20.6758,0],[20.7241,99.5106,0],[122.9981,140.233,0],[18.9521,90.8411,0],[61.3385,131.4013,0],[131.5098,140.6373,0],[235.2334,110.0783,0],[19.7126,116.9122,0],[18.3922,97.5087,0],[20.3177,109.0739,0],[16.0229,125.145,0],[19.9622,83.2431,1],[301.2082,44.8999,1],[94.8217,134.7215,0],[71.9254,120.4141,0],[16.7894,119.7227,0],[104.9322,129.6121,0],[37.248,117.0466,0],[143.588,132.2995,0],[149.6574,71.7708,0],[185.1901,108.9562,1],[15.3093,132.0257,0],[20.7415,80.7933,0],[63.943,110.1272,0],[137.4042,128.6422,0],[351.5016,101.9267,0],[84.4187,106.4031,0],[148.0342,120.9,0],[19.5955,93.769,1],[20.5763,79.3596,0],[32.9155,18.7515,1],[25.7716,63.0124,1],[19.7526,106.8355,0],[20.4926,86.9242,0],[17.6238,108.9612,0],[617.1209,142.8554,1],[17.1442,122.9637,0],[21.6196,68.888,1],[17.6049,110.0076,0],[181.684,48.9378,1],[13.5901,149.3855,0],[21.3564,98.5696,1],[160.9891,115.7781,0],[20.7616,77.3114,1],[130.9519,145.0181,0],[250.92,112.9425,0],[210.8983,44.1657,1],[14.4904,140.3538,0],[41.6296,134.113,0],[24.7342,39.077,1],[138.0122,121.1346,0],[19.6697,103.8065,0],[15.8532,126.3468,0],[22.0305,90.3481,0],[149.3515,72.1669,1],[24.4049,40.4628,1],[21.7065,92.9886,0],[319.2167,62.9796,1],[58.6583,127.4947,0],[295.4111,87.7038,0],[199.8863,121.7408,0],[176.009,125.4189,0],[218.5233,60.424,1],[345.8115,74.2746,1],[19.853,107.7314,0],[165.8258,86.3583,1],[18.0291,106.5175,0],[19.5151,91.7932,0],[29.7743,147.9022,0],[20.1758,97.1735,1],[18.2518,104.2674,1],[180.4658,115.5589,0],[17.9161,120.674,0],[26.0553,25.2407,0],[132.9469,130.9893,0],[18.1894,106.3372,0],[73.3628,126.7691,0],[19.8352,89.5742,0],[20.7888,80.988,0],[20.3648,81.0125,0],[18.0833,121.32,0],[18.6731,98.7208,1],[109.6833,120.4654,0],[18.347,103.9238,0],[203.1597,102.6774,0],[16.4718,120.8232,0],[17.8505,106.4326,1],[17.8288,105.0483,0],[83.6565,125.2135,0],[109.7171,123.6538,1],[63.7988,117.3152,0],[123.228,119.2424,0],[20.2766,85.4117,0],[22.1325,62.05,1],[15.3202,131.6024,0],[170.5367,125.4684,0],[462.3267,99.2773,0],[168.0184,60.8503,1],[185.0999,55.9964,1],[152.3535,87.5676,1],[19.4814,109.295,0],[117.1122,135.1979,0],[125.6953,108.5569,0],[98.7326,98.7318,0],[19.125,95.4366,0],[153.9076,121.5478,0],[560.6107,114.0701,1],[108.785,124.8181,0],[221.2039,110.9413,0],[20.7135,77.1116,0],[87.167,138.3904,1],[23.6159,46.3399,0],[30.0652,17.9593,1],[256.8449,63.9929,1],[153.9836,79.8963,1],[21.1447,99.4587,1],[152.7102,114.6867,0],[23.0375,61.853,1],[20.0903,101.4349,1],[207.7692,133.4743,0],[123.9496,67.3013,0],[192.1829,63.6096,0],[17.7467,116.7928,0],[64.9698,141.1858,0],[261.0751,109.9735,0],[16.7041,113.3604,0],[26.754,19.4015,1],[23.0268,52.1813,1],[16.7108,120.7607,0],[19.325,94.567,1],[281.516,140.0834,0],[59.2697,164.074,0],[26.102,52.6732,1],[123.758,130.4247,0],[20.1061,86.5755,1],[20.6094,71.2122,0],[225.5914,104.7317,0],[20.2279,85.1478,0],[18.9592,109.4139,0],[201.7213,92.4022,0],[203.683,84.2714,1],[18.2042,103.3715,0],[23.9422,46.6124,1],[115.9568,103.0176,0],[147.4439,96.4513,1],[16.2479,124.1863,0],[499.9912,113.2187,1],[149.5605,57.1535,1],[16.1984,124.346,0],[175.0577,98.5632,0],[19.4346,94.3735,0],[220.0683,110.571,0],[21.8091,85.7446,1],[26.1577,41.7507,1],[19.2502,91.8377,0],[119.0453,112.5365,0],[17.9885,131.8762,0],[17.365,108.6106,1],[353.773,123.0262,0],[23.8211,46.2846,1],[177.6588,137.286,1],[408.1967,94.6394,0],[43.5738,87.8201,0],[22.4682,85.228,1],[310.7888,110.8577,0],[17.704,109.2479,0],[416.9835,68.4363,1],[210.8729,59.3483,1],[17.7939,115.1282,0],[197.7509,125.7912,0],[18.8984,112.2446,1],[17.1813,126.8221,0],[219.7222,120.9085,0],[150.0579,76.7481,1],[125.5585,102.7359,0],[18.9102,95.7281,0],[21.2922,99.9438,0],[199.7813,114.4968,0],[23.3418,72.751,0],[25.0149,38.0259,0],[16.418,123.4877,0],[100.3384,90.0296,1],[19.6686,91.3787,1],[146.6346,51.1919,1],[183.3401,126.5368,0],[17.8541,103.5594,0],[18.8333,120.1519,0],[141.0744,98.8383,0],[15.4397,145.2004,0],[177.2568,131.5059,0],[17.8132,107.4145,1],[170.8829,104.1994,1],[111.8285,124.3368,0],[134.4514,118.2252,0],[21.73,67.3508,1],[164.3121,71.3385,0],[123.89,119.4285,0],[25.2184,64.8423,1],[74.9883,136.685,0],[225.9956,46.4862,1],[23.2372,50.2658,1],[21.0239,78.0524,1],[95.638,99.6272,0],[19.5319,107.6516,0],[535.0376,81.5186,1],[24.7838,57.899,1],[132.1695,93.6578,1],[23.8781,74.1336,0],[19.7566,86.0538,1],[18.265,105.5857,0],[26.5586,16.0186,1],[33.5692,129.6227,0],[26.3913,42.5666,1],[16.1256,123.6418,0],[199.2377,125.083,0],[21.3586,92.3142,0],[132.113,103.3792,0],[19.7859,85.8094,1],[18.6917,121.623,0]];
    datos_Prueba(data);
    // var cantidadNodos= document.getElementById("cantidadNodos").value;
    // for ( let i = 0; i < cantidadNodos; i ++) {
    //     var x = Math.floor ( Math.random () * height );
    //     var y = Math.floor ( Math.random () * height );
    //     data.push ([x, y,0]) ;
    //     fill (255 , 255 , 255) ;
    //     circle (x, height - y, 7) ; // 200 -y para q se dibuje apropiadamente
    //     textSize (10) ;
    //     text (x + ',' + y, x + 5, height - y);// 200 -y para q se dibuje
    //     //console.log(data);
    // }
    //aquipe()

    // console.log('listo 2');
    // const spawner = require('child_process').spawn;

    // // const data_to_pass_in ={
    // //     data_sent: 'Send this tu python',
    // //     data_returned: undefined
    // // }

    // // var data_to_pass_in = [[10,12]]

    // //console.log('data sent to python script', data_to_pass_in);
    // console.log('listo 2')
    // const python_process = spawner('python',['./app.py', JSON.stringify('data_to_pass_in')]);

    // python_process.stdout.on('data',(datas)=>{
    //     console.log('data recived: ',JSON.parse(datas.toString()));
    //     //console.log('data recived: ',JSON.parse(data.toString()));
    // console.log('listo 2')
    // data = JSON.parse(datas)
    // console.log(arra[1])
    // });
    //data = 
    // // console.log('aqui 2');
    // // console.log(dary());
    // // pruebaw();
    // // //const jsonData= require('./Pca_diabetes.json'); 
    // // console.log('aqui 3');
    // // data = pruebaw();

    // // console.log('aqui 4');
    // // //datos_Prueba(data);

    root = build_kdtree (data);
    console.log('aqui 5');
    console.log (root);

    
    drawGraph(generate_dot(root));

}

function graficarclosetPoint(roots=root){
    console.log('pc');
    var nearestPoint=closest_point(roots,pointP).node.point;
    fill(222, 15, 15);
    circle(nearestPoint[0],height-nearestPoint[1],10);
    console.log("El nodo mas cercano es: "+nearestPoint);
}



function datos_Prueba(datas){

    for(let i = 0; i < datas.length; ++i) {
        x = datas[i][0];
        y = datas[i][1];
        fill(57, 255, 20);
        circle(x, height - y, 4);
        textSize(8);
        //ext (x + ',' + y, x + 5, height - y);
    }
return
}

function drawGraph(dotString) {
    //console.log(dotString);
    let graphOptions = "node [fontsize=10 width=0.6 shape=circle style=filled fixedsize=shape] \n"
    let diagramText = "digraph G { \n" + dotString + "}";
    let viz = new Viz();

    viz.renderSVGElement("digraph G { " + graphOptions + dotString + "}")
        //console.log('viz')
        .then(function (element) {
            //console.log('viz')
            var parentTree = document.getElementById('KdTreeSvg');
            parentTree.innerHTML = element.outerHTML;
            //console.log('viz')
            let dotText = document.getElementById('DotText');
            dotText.innerText = diagramText;
        })
        .catch(error => {
            //console.log(error);
        });
}


function graficarKNN(){
    var cantidadK= document.getElementById("cantidadKnn").value;
    var knn=findKNN(root,pointP,parseInt(cantidadK)).nearestNodes;
    for(let i=0;i<knn.length;i++){
        fill(222, 15, 15);
        circle(knn[i].point[0],height-knn[i].point[1],6); //200-y para q se dibuje apropiadamente 
        console.log(knn[i].point);
        console.log(knn[i].point[2]);
    }
}


function rangeCir(){
    //console.log('prueba1');
    var fe = [];
    var pon = pointP//[140, 90];
    //var h = [50, 100];
    var radio= document.getElementById("radio").value;
    //var radio = 75;

    range_query_circle(root,pon,radio,fe);
    fill(0,255,0,40);
    circle(pon[0],height-pon[1],radio*2)
}


function rangeRec(){
    //console.log('prueba1');
    var fe = [];
    var pon = pointP//[140, 90];
    var l1= document.getElementById("lado1").value;
    var l2= document.getElementById("lado2").value;
    var h = [l1, l2];
    //var radio= document.getElementById("radio").value;
    var radio = 50;

    range_query_rect(root,pon,h,fe);
    fill(0,255,0,40);
    rect(pon[0]-h[0],height-pon[1]-h[1],h[0]*2,h[1]*2)

    for (let i = 0; i < fe.length; i++){
        fill(0, 255, 0);
        circle(fe[i][0], height - fe[i][1], 7); //200-y para q se dibuje apropiadamente
        textSize(10);
        text(fe[i][0] + ',' + fe[i][1], fe[i][0] + 5, height - fe[i][1]); //200-y para q se dibuje apropiadamente
    }
}


document.getElementsByClassName("holamundos")[0].addEventListener("click", e => {
	e.preventDefault();
    console.log('prueba click');
	// let key = document.getElementsByClassName("key")[0].value;
	// let val = 0 //document.getElementsByClassName("value")[0].value;

	// tree.insertNode(key, val);

	// Clear input fields
	document.getElementsByClassName("holamundostex")[0].value = "hola mundo";
	//document.getElementsByClassName("value")[0].value = "";
});


// function aquipe(){
//     console.log("primero")
//     const spawner = require('child_process').spawn;

//     // const data_to_pass_in ={
//     //     data_sent: 'Send this tu python',
//     //     data_returned: undefined
//     // }

//     // var data_to_pass_in = [[10,12]]
//     console.log("primero 2")
//     //console.log('data sent to python script', data_to_pass_in);

//     const python_process = spawner('python',['./app.py', JSON.stringify('data_to_pass_in')]);

//     python_process.stdout.on('data',(datas)=>{
//         console.log('data recived: ',JSON.parse(datas.toString()));
//         //console.log('data recived: ',JSON.parse(data.toString()));
//     //console.log('listo 2')
//     arra = JSON.parse(datas)
//     console.log(arra[1])
//     });
// //return arra
// }