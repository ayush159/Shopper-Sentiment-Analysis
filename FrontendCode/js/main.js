var code = "";
function logout(){}
(function ($) {
  // USE STRICT
  "use strict";
  
  var apigClient = apigClientFactory.newClient({});

  var AWSconfig = {
		"accessKey":"",
		"secretKey":"",
		"S3Bucket":"<Enter bucket URL>",
		"region":"<Enter Region>",
		"sessionToken":"",
		"client_id" :"<>",
		"user_pool_id" : "<>",
		"cognito_domain_url":"<Enter Cognito Domain URL>",
		"redirect_uri" : "<>",
		"identity_pool_id":"<>"
  };
  
  var getParameterByName = function(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	};

  // console.log("Code = "+getParameterByName("code"));
  code = getParameterByName("code");
  // console.log(sessionStorage.getItem('code11'));
  if(sessionStorage.getItem('code11')){
    code = sessionStorage.getItem('code11');
    var username = document.getElementById("username");
    var username1 = document.getElementById("username1");
    var email = document.getElementById("email");
    username.innerHTML = sessionStorage.getItem('username11').split("@")[0];
    username1.innerHTML = sessionStorage.getItem('username11').split("@")[0];
    email.innerHTML = sessionStorage.getItem('username11');
  }
  else{
    code = getParameterByName("code");
    sessionStorage.setItem('code11', code);
  
  // console.log(code);
  var exchangeAuthCodeForCredentials = function({auth_code = code,
													client_id = AWSconfig.client_id,
													identity_pool_id = AWSconfig.identity_pool_id,
													aws_region =AWSconfig.region,
													user_pool_id = AWSconfig.user_pool_id,
													cognito_domain_url= AWSconfig.cognito_domain_url,
													redirect_uri = AWSconfig.redirect_uri}) {
		return new Promise((resolve, reject) => {
			var settings = {
				url: `${cognito_domain_url}/oauth2/token`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					grant_type: 'authorization_code',
					client_id: client_id,
					redirect_uri: redirect_uri,
					code: auth_code
				}
			};
			$.ajax(settings).done(function (response) {
				// console.log('OAuth2 Token Call Responded');
        // console.log(response);
        code = response.access_token;
        var test = 'Bearer ' + response.access_token;
        var fetchname = {
          url: `${cognito_domain_url}/oauth2/userInfo`,
          method: 'GET',
          headers:{
            'Authorization': test
          }
        };
        $.ajax(fetchname).done(function(token){
          sessionStorage.setItem('username11', token.email);
          var username = document.getElementById("username");
          var username1 = document.getElementById("username1");
          var email = document.getElementById("email");
          username.innerHTML = sessionStorage.getItem('username11').split("@")[0];
          username1.innerHTML = sessionStorage.getItem('username11').split("@")[0];
          email.innerHTML = sessionStorage.getItem('username11')
        })
				if (response.id_token) {
					AWS.config.region = aws_region;
					AWS.config.credentials = new AWS.CognitoIdentityCredentials({
						IdentityPoolId : identity_pool_id,
						Logins : {
							[`cognito-idp.${aws_region}.amazonaws.com/${user_pool_id}`]: response.id_token
						}
					});

					console.log({IdentityPoolId : identity_pool_id,
						Logins : {
							[`cognito-idp.${aws_region}.amazonaws.com/${user_pool_id}`]: response.id_token
						}
					});

					AWS.config.credentials.refresh(function (error) {
						console.log("Error",error);
						if (error) {
							reject(error);
						} else {
							console.log('Successfully Logged In');
							resolve(AWS.config.credentials);
						}
					});
				} else {
					reject(response);
				}
			});
		});
  };
  exchangeAuthCodeForCredentials({auth_code: code,
									client_id: AWSconfig.client_id,
									identity_pool_id: AWSconfig.identity_pool_id,
									aws_region: AWSconfig.region,
									user_pool_id: AWSconfig.user_pool_id,
									cognito_domain_url: AWSconfig.cognito_domain_url,
									redirect_uri: AWSconfig.redirect_uri})
	.then(function(response) { 
		// console.log("Inside Then Function",response);
		apigClient = apigClientFactory.newClient({
			accessKey: response.accessKeyId,
			secretKey: response.secretAccessKey,
			sessionToken: response.sessionToken,
			region: "us-east-1"
		});
	})
	.catch(function(error) {
		console.log("error = "+this.error);
		console.log("response = "+this.response);
  });
}

  try {

    var ctx7_1 = document.getElementById("total_customers")
    if (ctx7_1) {
      var params = {
      };
      var body = {
        'q': 'SELECT COUNT(*) AS COUNTS FROM ssaretail_instore_demo_processed'
      };  

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            ctx7_1.innerHTML = parsed['data'][0].COUNTS
          }).catch( function(result){
            console.log(result);
          });
}

var ctx8_1 = document.getElementById("happy_percent")
    if (ctx8_1) {
      var params = {
      };
      var body = {
        'q': 'SELECT (COUNT(*)*100)/(SELECT COUNT(*) FROM ssaretail_instore_demo_processed) AS PERCENT  FROM ssaretail_instore_demo_processed WHERE EMOTION=\'HAPPY\'or EMOTION=\'CALM\''
      };  

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            ctx8_1.innerHTML = parsed['data'][0].PERCENT+'%'
          }).catch( function(result){
            console.log(result);
          });
}

var ctx9_1 = document.getElementById("unhappy_percent")
    if (ctx9_1) {
      var params = {
      };
      var body = {
        'q': 'SELECT (COUNT(*)*100)/(SELECT COUNT(*) FROM ssaretail_instore_demo_processed) AS PERCENT  FROM ssaretail_instore_demo_processed WHERE EMOTION=\'SAD\'or EMOTION=\'DISGUSTED\''
      };  

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            ctx9_1.innerHTML = parsed['data'][0].PERCENT+'%'
          }).catch( function(result){
            console.log(result);
          });
}
    //WidgetChart 1
    var ctx7 = document.getElementById("widgetChart1");
    if (ctx7) {

      var params = {
      };
      var body = {
        'q': 'SELECT COUNT(*) AS COUNTS,partition_2 FROM ssaretail_instore_demo_processed GROUP BY partition_2 ORDER BY partition_2'
      };  

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            console.log(parsed)
            // console.log(parsed['data'][0]);
            var value = [];
            var label = [];
            for (var i=0; i < parsed['data'].length; i++) {
               // var person = [parsed[i].name, parsed[i].place, parsed[i].phone];
               value.push(Number(parsed['data'][i].COUNTS))
               label.push(parsed['data'][i].partition_2)
            }

      ctx7.height = 100;
      var myChart = new Chart(ctx7, {
        type: 'line',
        data: {
          labels: label,
          type: 'line',
          datasets: [{
            data: value,
            label: 'December',
            backgroundColor: 'rgba(255,255,255,.1)',
            borderColor: 'rgba(255,255,255,.55)',
          },]
        },
        options: {
          maintainAspectRatio: true,
          legend: {
            display: false
          },
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }
          },
          responsive: true,
          scales: {
            xAxes: [{
              gridLines: {
                color: 'transparent',
                zeroLineColor: 'transparent'
              },
              ticks: {
                fontSize: 2,
                fontColor: 'transparent'
              }
            }],
            yAxes: [{
              display: false,
              ticks: {
                display: false,
              }
            }]
          },
          title: {
            display: false,
          },
          elements: {
            line: {
              borderWidth: 0
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4
            }
          }
        }
      });}).catch( function(result){
            console.log(result);
          });
      
    }
  
    


    //WidgetChart 2
    var ctx = document.getElementById("widgetChart2");
    if (ctx) {
      ctx.height = 130;
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          type: 'line',
          datasets: [{
            data: [1, 18, 9, 17, 34, 22],
            label: 'Dataset',
            backgroundColor: 'transparent',
            borderColor: 'rgba(255,255,255,.55)',
          },]
        },
        options: {

          maintainAspectRatio: false,
          legend: {
            display: false
          },
          responsive: true,
          tooltips: {
            mode: 'index',
            titleFontSize: 12,
            titleFontColor: '#000',
            bodyFontColor: '#000',
            backgroundColor: '#fff',
            titleFontFamily: 'Montserrat',
            bodyFontFamily: 'Montserrat',
            cornerRadius: 3,
            intersect: false,
          },
          scales: {
            xAxes: [{
              gridLines: {
                color: 'transparent',
                zeroLineColor: 'transparent'
              },
              ticks: {
                fontSize: 2,
                fontColor: 'transparent'
              }
            }],
            yAxes: [{
              display: false,
              ticks: {
                display: false,
              }
            }]
          },
          title: {
            display: false,
          },
          elements: {
            line: {
              tension: 0.00001,
              borderWidth: 1
            },
            point: {
              radius: 4,
              hitRadius: 10,
              hoverRadius: 4
            }
          }
        }
      });
    }


    //WidgetChart 3
    var ctx = document.getElementById("widgetChart3");
    if (ctx) {
      ctx.height = 130;
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          type: 'line',
          datasets: [{
            data: [65, 59, 84, 84, 51, 55],
            label: 'Dataset',
            backgroundColor: 'transparent',
            borderColor: 'rgba(255,255,255,.55)',
          },]
        },
        options: {

          maintainAspectRatio: false,
          legend: {
            display: false
          },
          responsive: true,
          tooltips: {
            mode: 'index',
            titleFontSize: 12,
            titleFontColor: '#000',
            bodyFontColor: '#000',
            backgroundColor: '#fff',
            titleFontFamily: 'Montserrat',
            bodyFontFamily: 'Montserrat',
            cornerRadius: 3,
            intersect: false,
          },
          scales: {
            xAxes: [{
              gridLines: {
                color: 'transparent',
                zeroLineColor: 'transparent'
              },
              ticks: {
                fontSize: 2,
                fontColor: 'transparent'
              }
            }],
            yAxes: [{
              display: false,
              ticks: {
                display: false,
              }
            }]
          },
          title: {
            display: false,
          },
          elements: {
            line: {
              borderWidth: 1
            },
            point: {
              radius: 4,
              hitRadius: 10,
              hoverRadius: 4
            }
          }
        }
      });
    }


    //WidgetChart 4
    var ctx = document.getElementById("widgetChart4");
    if (ctx) {
      ctx.height = 115;
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          datasets: [
            {
              label: "My First dataset",
              data: [78, 81, 80, 65, 58, 75, 60, 75, 65, 60, 60, 75],
              borderColor: "transparent",
              borderWidth: "0",
              backgroundColor: "rgba(255,255,255,.3)"
            }
          ]
        },
        options: {
          maintainAspectRatio: true,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: false,
              categoryPercentage: 1,
              barPercentage: 0.65
            }],
            yAxes: [{
              display: false
            }]
          }
        }
      });
    }

    // Recent Report
    const brandProduct = 'rgba(0,181,233,0.8)'
    const brandService = 'rgba(0,173,95,0.8)'

    var elements = 10
    var data1 = [52, 60, 55, 50, 65, 80, 57, 70, 105, 115]
    var data2 = [102, 70, 80, 100, 56, 53, 80, 75, 65, 90]

    var ctx = document.getElementById("recent-rep-chart");
    if (ctx) {
      ctx.height = 250;
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', ''],
          datasets: [
            {
              label: 'My First dataset',
              backgroundColor: brandService,
              borderColor: 'transparent',
              pointHoverBackgroundColor: '#fff',
              borderWidth: 0,
              data: data1

            },
            {
              label: 'My Second dataset',
              backgroundColor: brandProduct,
              borderColor: 'transparent',
              pointHoverBackgroundColor: '#fff',
              borderWidth: 0,
              data: data2

            }
          ]
        },
        options: {
          maintainAspectRatio: true,
          legend: {
            display: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              gridLines: {
                drawOnChartArea: true,
                color: '#f2f2f2'
              },
              ticks: {
                fontFamily: "Poppins",
                fontSize: 12
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 5,
                stepSize: 50,
                max: 150,
                fontFamily: "Poppins",
                fontSize: 12
              },
              gridLines: {
                display: true,
                color: '#f2f2f2'

              }
            }]
          },
          elements: {
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3
            }
          }


        }
      });
    }

    // Percent Chart
    var ctx = document.getElementById("percent-chart");
    if (ctx) {
      ctx.height = 280;
      var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [
            {
              label: "My First dataset",
              data: [60, 40],
              backgroundColor: [
                '#00b5e9',
                '#fa4251'
              ],
              hoverBackgroundColor: [
                '#00b5e9',
                '#fa4251'
              ],
              borderWidth: [
                0, 0
              ],
              hoverBorderColor: [
                'transparent',
                'transparent'
              ]
            }
          ],
          labels: [
            'Products',
            'Services'
          ]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          cutoutPercentage: 55,
          animation: {
            animateScale: true,
            animateRotate: true
          },
          legend: {
            display: false
          },
          tooltips: {
            titleFontFamily: "Poppins",
            xPadding: 15,
            yPadding: 10,
            caretPadding: 0,
            bodyFontSize: 16
          }
        }
      });
    }

  } catch (error) {
    console.log(error);
  }



  try {

    // Recent Report 2
    const bd_brandProduct2 = 'rgba(0,181,233,0.9)'
    const bd_brandService2 = 'rgba(0,173,95,0.9)'
    const brandProduct2 = 'rgba(0,181,233,0.2)'
    const brandService2 = 'rgba(0,173,95,0.2)'

    var data3 = [52, 60, 55, 50, 65, 80, 57, 70, 105, 115]
    var data4 = [102, 70, 80, 100, 56, 53, 80, 75, 65, 90]

    var ctx = document.getElementById("recent-rep2-chart");
    if (ctx) {
      ctx.height = 230;
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', ''],
          datasets: [
            {
              label: 'My First dataset',
              backgroundColor: brandService2,
              borderColor: bd_brandService2,
              pointHoverBackgroundColor: '#fff',
              borderWidth: 0,
              data: data3

            },
            {
              label: 'My Second dataset',
              backgroundColor: brandProduct2,
              borderColor: bd_brandProduct2,
              pointHoverBackgroundColor: '#fff',
              borderWidth: 0,
              data: data4

            }
          ]
        },
        options: {
          maintainAspectRatio: true,
          legend: {
            display: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              gridLines: {
                drawOnChartArea: true,
                color: '#f2f2f2'
              },
              ticks: {
                fontFamily: "Poppins",
                fontSize: 12
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 5,
                stepSize: 50,
                max: 150,
                fontFamily: "Poppins",
                fontSize: 12
              },
              gridLines: {
                display: true,
                color: '#f2f2f2'

              }
            }]
          },
          elements: {
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3
            },
            line: {
              tension: 0
            }
          }


        }
      });
    }

  } catch (error) {
    console.log(error);
  }


  try {

    // Recent Report 3
    const bd_brandProduct3 = 'rgba(0,181,233,0.9)';
    const bd_brandService3 = 'rgba(0,173,95,0.9)';
    const brandProduct3 = 'transparent';
    const brandService3 = 'transparent';

    var data5 = [52, 60, 55, 50, 65, 80, 57, 115];
    var data6 = [102, 70, 80, 100, 56, 53, 80, 90];

    var ctx = document.getElementById("recent-rep3-chart");
    if (ctx) {
      ctx.height = 230;
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', ''],
          datasets: [
            {
              label: 'My First dataset',
              backgroundColor: brandService3,
              borderColor: bd_brandService3,
              pointHoverBackgroundColor: '#fff',
              borderWidth: 0,
              data: data5,
              pointBackgroundColor: bd_brandService3
            },
            {
              label: 'My Second dataset',
              backgroundColor: brandProduct3,
              borderColor: bd_brandProduct3,
              pointHoverBackgroundColor: '#fff',
              borderWidth: 0,
              data: data6,
              pointBackgroundColor: bd_brandProduct3

            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              gridLines: {
                drawOnChartArea: true,
                color: '#f2f2f2'
              },
              ticks: {
                fontFamily: "Poppins",
                fontSize: 12
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 5,
                stepSize: 50,
                max: 150,
                fontFamily: "Poppins",
                fontSize: 12
              },
              gridLines: {
                display: false,
                color: '#f2f2f2'
              }
            }]
          },
          elements: {
            point: {
              radius: 3,
              hoverRadius: 4,
              hoverBorderWidth: 3,
              backgroundColor: '#333'
            }
          }


        }
      });
    }

  } catch (error) {
    console.log(error);
  }

  try {
    //WidgetChart 5
    var ctx = document.getElementById("widgetChart5");
    if (ctx) {
      ctx.height = 220;
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          datasets: [
            {
              label: "My First dataset",
              data: [78, 81, 80, 64, 65, 80, 70, 75, 67, 85, 66, 68],
              borderColor: "transparent",
              borderWidth: "0",
              backgroundColor: "#ccc",
            }
          ]
        },
        options: {
          maintainAspectRatio: true,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: false,
              categoryPercentage: 1,
              barPercentage: 0.65
            }],
            yAxes: [{
              display: false
            }]
          }
        }
      });
    }

  } catch (error) {
    console.log(error);
  }

  try {

    // Percent Chart 2
    var ctx = document.getElementById("percent-chart2");
    if (ctx) {
      ctx.height = 209;
      var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [
            {
              label: "My First dataset",
              data: [60, 40],
              backgroundColor: [
                '#00b5e9',
                '#fa4251'
              ],
              hoverBackgroundColor: [
                '#00b5e9',
                '#fa4251'
              ],
              borderWidth: [
                0, 0
              ],
              hoverBorderColor: [
                'transparent',
                'transparent'
              ]
            }
          ],
          labels: [
            'Products',
            'Services'
          ]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          cutoutPercentage: 87,
          animation: {
            animateScale: true,
            animateRotate: true
          },
          legend: {
            display: false,
            position: 'bottom',
            labels: {
              fontSize: 14,
              fontFamily: "Poppins,sans-serif"
            }

          },
          tooltips: {
            titleFontFamily: "Poppins",
            xPadding: 15,
            yPadding: 10,
            caretPadding: 0,
            bodyFontSize: 16,
          }
        }
      });
    }

  } catch (error) {
    console.log(error);
  }

  try {
    //Sales chart
    var ctx6 = document.getElementById("sales-chart");
    if (ctx6) {

      var params = {
      };
      var body = {
        'q': 'SELECT count(*) AS COUNT,\
             emotion,\
             partition_2\
             FROM ssaretail_instore_demo_processed\
             GROUP BY  partition_2,emotion\
             ORDER BY  partition_2,emotion'
      };    

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            console.log(parsed)
            // console.log(parsed['data'][0]);
            var value_angry = [];
            var value_sad = [];
            var value_happy = [];
            var value_disgusted = [];
            var value_calm = [];
            var value_surprised = [];
            var visited = [];
            // var emotions = ['ANGRY','CALM','DISGUSTED','HAPPY','SAD','SURPRISED']

            var day = [];
            day.push(parsed['data'][0].partition_2);
            var e=parsed['data'][0].partition_2

            for (var i=0; i < parsed['data'].length; i++) {
               var e1=parsed['data'][i].partition_2
               if(e1 == e){
                if (parsed['data'][i].emotion == 'ANGRY') {
                value_angry.push(Number(parsed['data'][i].COUNT))
                visited.push('ANGRY')
                // day.push(parsed['data'][i].partition_2)
               }
               if (parsed['data'][i].emotion == 'CALM') {
                value_calm.push(Number(parsed['data'][i].COUNT))
                visited.push('CALM')
               }
               if (parsed['data'][i].emotion == 'DISGUSTED') {
                value_disgusted.push(Number(parsed['data'][i].COUNT))
                visited.push('DISGUSTED')
               }
               if (parsed['data'][i].emotion == 'HAPPY') {
                value_happy.push(Number(parsed['data'][i].COUNT))
                visited.push('HAPPY')
               }
               if (parsed['data'][i].emotion == 'SAD') {
                value_sad.push(Number(parsed['data'][i].COUNT))
                visited.push('SAD')
               }
               if (parsed['data'][i].emotion == 'SURPRISED') {
                value_surprised.push(Number(parsed['data'][i].COUNT))
                visited.push('SURPRISED')
               }
               }
               else{

                if (visited.indexOf("ANGRY") == -1){
                  value_angry.push(0)
                }
                if (visited.indexOf("CALM") == -1){
                  value_calm.push(0)
                }
                if (visited.indexOf("DISGUSTED") == -1){
                  value_disgusted.push(0)
                }
                if (visited.indexOf("HAPPY") == -1){
                  value_happy.push(0)
                }
                if (visited.indexOf("SAD") == -1){
                  value_sad.push(0)
                }
                if (visited.indexOf("SURPRISED") == -1){
                  value_surprised.push(0)
                }
                visited = [];
                day.push(parsed['data'][i].partition_2)
                e = parsed['data'][i].partition_2

                if (parsed['data'][i].emotion == 'ANGRY') {
                value_angry.push(Number(parsed['data'][i].COUNT))
                visited.push('ANGRY')
                // day.push(parsed['data'][i].partition_2)
               }
               if (parsed['data'][i].emotion == 'CALM') {
                value_calm.push(Number(parsed['data'][i].COUNT))
                visited.push('CALM')
               }
               if (parsed['data'][i].emotion == 'DISGUSTED') {
                value_disgusted.push(Number(parsed['data'][i].COUNT))
                visited.push('DISGUSTED')
               }
               if (parsed['data'][i].emotion == 'HAPPY') {
                value_happy.push(Number(parsed['data'][i].COUNT))
                visited.push('HAPPY')
               }
               if (parsed['data'][i].emotion == 'SAD') {
                value_sad.push(Number(parsed['data'][i].COUNT))
                visited.push('SAD')
               }
               if (parsed['data'][i].emotion == 'SURPRISED') {
                value_surprised.push(Number(parsed['data'][i].COUNT))
                visited.push('SURPRISED')
               }
               }
            }
      console.log(value_angry)
      console.log(value_calm)
      console.log(value_disgusted)
      console.log(value_happy)
      console.log(value_sad)
      console.log(value_surprised)
      console.log(day)
            // console.log(value_female)
            // console.log(emotion)

      ctx6.height = 200;
      var myChart = new Chart(ctx6, {
        type: 'line',
        data: {
          labels: day,
          type: 'line',
          defaultFontFamily: 'Poppins',
          datasets: [{
            label: "ANGRY",
            data: value_angry,
            backgroundColor: 'transparent',
            borderColor: 'rgba(94, 97, 255,0.75)',
            borderWidth: 3,
            pointStyle: 'circle',
            pointRadius: 5,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'rgba(94, 97, 255,0.75)',
          }, {
            label: "CALM",
            data: value_calm,
            backgroundColor: 'transparent',
            borderColor: 'rgba(100, 102, 247,0.75)',
            borderWidth: 3,
            pointStyle: 'circle',
            pointRadius: 5,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'rgba(100, 102, 247,0.75)',
          }, {
            label: "DISGUSTED",
            data: value_disgusted,
            backgroundColor: 'transparent',
            borderColor: 'rgba(128, 130, 255,0.75)',
            borderWidth: 3,
            pointStyle: 'circle',
            pointRadius: 5,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'rgba(128, 130, 255,0.75)',
          }, {
            label: "HAPPY",
            data: value_happy,
            backgroundColor: 'transparent',
            borderColor: 'rgba(179, 180, 255,0.75)',
            borderWidth: 3,
            pointStyle: 'circle',
            pointRadius: 5,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'rgba(179, 180, 255,0.75)',
          }, {
            label: "SAD",
            data: value_sad,
            backgroundColor: 'transparent',
            borderColor: 'rgba(204, 205, 255,0.75)',
            borderWidth: 3,
            pointStyle: 'circle',
            pointRadius: 5,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'rgba(204, 205, 255,0.75)',
          }, {
            label: "SURPRISED",
            data: value_surprised,
            backgroundColor: 'transparent',
            borderColor: 'rgba(230, 230, 255,0.75)',
            borderWidth: 3,
            pointStyle: 'circle',
            pointRadius: 5,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'rgba(230, 230, 255,0.75)',
          }]
        },
        options: {
          responsive: true,
          tooltips: {
            mode: 'index',
            titleFontSize: 12,
            titleFontColor: '#000',
            bodyFontColor: '#000',
            backgroundColor: '#fff',
            titleFontFamily: 'Poppins',
            bodyFontFamily: 'Poppins',
            cornerRadius: 3,
            intersect: false,
          },
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              fontFamily: 'Poppins',
            },
          },
          scales: {
            xAxes: [{
              display: true,
              gridLines: {
                display: false,
                drawBorder: false
              },
              scaleLabel: {
                display: false,
                labelString: 'Month'
              },
              ticks: {
                fontFamily: "Poppins"
              }
            }],
            yAxes: [{
              display: true,
              gridLines: {
                display: false,
                drawBorder: false
              },
              scaleLabel: {
                display: true,
                labelString: 'Value',
                fontFamily: "Poppins"

              },
              ticks: {
                fontFamily: "Poppins"
              }
            }]
          },
          title: {
            display: false,
            text: 'Normal Legend'
          }
        }
      });
      }).catch( function(result){
            console.log(result);
          });
      
    }
  } catch (error) {
    console.log(error);
  }

  try {

    //Team chart
    var ctx5 = document.getElementById("team-chart");
    if (ctx5) {

      var params = {
      };
      var body = {
        'q': 'WITH TEST AS\
              (SELECT count(*) AS COUNT,\
                   partition_3,\
                   partition_2\
              FROM ssaretail_instore_demo_processed\
              GROUP BY  partition_3,partition_2\
              ORDER BY  partition_2,partition_3)\
              SELECT SUM(COUNT)/count(*) AS avg,partition_3\
              FROM TEST\
              GROUP BY  partition_3\
              ORDER BY  partition_3'
      };  

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            console.log(parsed)
            // console.log(parsed['data'][0]);
            var value = [];
            var label = [];
            for (var i=0; i < parsed['data'].length; i++) {
               // var person = [parsed[i].name, parsed[i].place, parsed[i].phone];
               value.push(Number(parsed['data'][i].avg))
               label.push(parsed['data'][i].partition_3)
            }
            // console.log(value)
            // console.log(label)
            // console.log(ctx5)

      ctx5.height = 200;
      var myChart = new Chart(ctx5, {
        type: 'line',
        data: {
          labels: label,
          type: 'line',
          defaultFontFamily: 'Poppins',
          datasets: [{
            data: value,
            label: "Average",
            backgroundColor: 'rgba(0,103,255,.15)',
            borderColor: 'rgba(0,103,255,0.5)',
            borderWidth: 3.5,
            pointStyle: 'circle',
            pointRadius: 5,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'rgba(0,103,255,0.5)',
          },]
        },
        options: {
          responsive: true,
          tooltips: {
            mode: 'index',
            titleFontSize: 12,
            titleFontColor: '#000',
            bodyFontColor: '#000',
            backgroundColor: '#fff',
            titleFontFamily: 'Poppins',
            bodyFontFamily: 'Poppins',
            cornerRadius: 3,
            intersect: false,
          },
          legend: {
            display: false,
            position: 'top',
            labels: {
              usePointStyle: true,
              fontFamily: 'Poppins',
            },


          },
          scales: {
            xAxes: [{
              display: true,
              gridLines: {
                display: false,
                drawBorder: false
              },
              scaleLabel: {
                display: false,
                labelString: 'Month'
              },
              ticks: {
                fontFamily: "Poppins"
              }
            }],
            yAxes: [{
              display: true,
              gridLines: {
                display: false,
                drawBorder: false
              },
              scaleLabel: {
                display: true,
                labelString: 'Value',
                fontFamily: "Poppins"
              },
              ticks: {
                fontFamily: "Poppins"
              }
            }]
          },
          title: {
            display: false,
          }
        }
      });
      }).catch( function(result){
            console.log(result);
          });
      
    }
  } catch (error) {
    console.log(error);
  }

  try {
    //bar chart
    var ctx4 = document.getElementById("barChart");
    if (ctx4) {

      var params = {
      };
      var body = {
        'q': 'SELECT COUNT(*) AS COUNT,\
              EMOTION,\
              GENDER\
              FROM ssaretail_instore_demo_processed\
              GROUP BY  EMOTION,GENDER\
              ORDER BY  EMOTION'
      };    

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            console.log(parsed)
            // console.log(parsed['data'][0]);
            var value_male = [];
            var value_female = [];
            var emotion = [];
            // var gender = [];
            for (var i=0; i < parsed['data'].length; i++) {
               // var person = [parsed[i].name, parsed[i].place, parsed[i].phone];
               if (parsed['data'][i].GENDER == 'Male') {
                value_male.push(Number(parsed['data'][i].COUNT))
                emotion.push(parsed['data'][i].EMOTION)
               }
               if (parsed['data'][i].GENDER == 'Female') {
                value_female.push(Number(parsed['data'][i].COUNT))
                // emotion.push(parsed['data'][i].EMOTION)
               }
               // value.push(Number(parsed['data'][i].COUNT))
               
               // gender.push(parsed['data'][i].GENDER)
            }
            // console.log(value_male)
            // console.log(value_female)
            // console.log(emotion)
            // console.log(ctx4)

      ctx4.height = 200;
      var myChart = new Chart(ctx4, {
        type: 'bar',
        defaultFontFamily: 'Poppins',
        data: {
          labels: emotion,
          datasets: [
            {
              label: "Male",
              data: value_male,
              borderColor: "rgba(0, 123, 255, 0.9)",
              borderWidth: "0",
              backgroundColor: "rgba(0, 123, 255, 0.5)",
              fontFamily: "Poppins"
            },
            {
              label: "Female",
              data: value_female,
              borderColor: "rgba(0,0,0,0.09)",
              borderWidth: "0",
              backgroundColor: "rgba(0,0,0,0.07)",
              fontFamily: "Poppins"
            }
          ]
        },
        options: {
          legend: {
            position: 'top',
            labels: {
              fontFamily: 'Poppins'
            }

          },
          scales: {
            xAxes: [{
              ticks: {
                fontFamily: "Poppins"

              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontFamily: "Poppins"
              }
            }]
          }
        }
      });
      }).catch( function(result){
        console.log(result);
      });
      //end apig before this

    }

  } catch (error) {
    console.log(error);
  }

  try {

    //radar chart
    var ctx = document.getElementById("radarChart");
    if (ctx) {
      ctx.height = 200;
      var myChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: [["Eating", "Dinner"], ["Drinking", "Water"], "Sleeping", ["Designing", "Graphics"], "Coding", "Cycling", "Running"],
          defaultFontFamily: 'Poppins',
          datasets: [
            {
              label: "My First dataset",
              data: [65, 59, 66, 45, 56, 55, 40],
              borderColor: "rgba(0, 123, 255, 0.6)",
              borderWidth: "1",
              backgroundColor: "rgba(0, 123, 255, 0.4)"
            },
            {
              label: "My Second dataset",
              data: [28, 12, 40, 19, 63, 27, 87],
              borderColor: "rgba(0, 123, 255, 0.7",
              borderWidth: "1",
              backgroundColor: "rgba(0, 123, 255, 0.5)"
            }
          ]
        },
        options: {
          legend: {
            position: 'top',
            labels: {
              fontFamily: 'Poppins'
            }

          },
          scale: {
            ticks: {
              beginAtZero: true,
              fontFamily: "Poppins"
            }
          }
        }
      });
    }

  } catch (error) {
    console.log(error)
  }

  try {

    //line chart
    var ctx = document.getElementById("lineChart");
    if (ctx) {
      ctx.height = 150;
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ["Store open - Noon", "Noon - Evening", "Evening - Night"],
          defaultFontFamily: "Poppins",
          datasets: [
            {
              label: "My First dataset",
              borderColor: "rgba(0,0,0,.09)",
              borderWidth: "1",
              backgroundColor: "rgba(0,0,0,.07)",
              data: [22, 44, 67, 43, 76, 45, 12]
            },
            {
              label: "My Second dataset",
              borderColor: "rgba(0, 123, 255, 0.9)",
              borderWidth: "1",
              backgroundColor: "rgba(0, 123, 255, 0.5)",
              pointHighlightStroke: "rgba(26,179,148,1)",
              data: [16, 32, 18, 26, 42, 33, 44]
            }
          ]
        },
        options: {
          legend: {
            position: 'top',
            labels: {
              fontFamily: 'Poppins'
            }

          },
          responsive: true,
          tooltips: {
            mode: 'index',
            intersect: false
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              ticks: {
                fontFamily: "Poppins"

              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontFamily: "Poppins"
              }
            }]
          }

        }
      });
    }


  } catch (error) {
    console.log(error);
  }


  try {

    //doughut chart
    var ctx1 = document.getElementById("doughutChart");
    console.log(ctx1)
    if (ctx1) {
      var params = {
      };
      var body = {
        'q': 'SELECT COUNT(*) AS COUNT,\
                EMOTION\
              FROM ssaretail_instore_demo_processed\
              GROUP BY  EMOTION'
      };  

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            console.log(parsed)
            // console.log(parsed['data'][0]);
            var value = [];
            var label = [];
            for (var i=0; i < parsed['data'].length; i++) {
               // var person = [parsed[i].name, parsed[i].place, parsed[i].phone];
               value.push(Number(parsed['data'][i].COUNT))
               label.push(parsed['data'][i].EMOTION)
            }
            // console.log(value)
            // console.log(label)
            // console.log(ctx1)
            ctx1.height = 200;
            var myChart = new Chart(ctx1, {
              type: 'doughnut',
              data: {
                datasets: [{
                  data: value,
                  backgroundColor: [
                    "rgba(0, 123, 255,0.9)",
                    "rgba(0, 123, 255,0.7)",
                    "rgba(0, 123, 255,0.5)",
                    "rgba(0, 123, 255, 0.3)",
                    "rgba(0, 123, 255, 0.2)",
                    "rgba(0, 123, 255, 0.1)"
                  ],
                  hoverBackgroundColor: [
                    "rgba(0, 123, 255,0.9)",
                    "rgba(0, 123, 255,0.7)",
                    "rgba(0, 123, 255,0.5)",
                    "rgba(0, 123, 255, 0.3)",
                    "rgba(0, 123, 255, 0.2)",
                    "rgba(0, 123, 255, 0.1)"
                  ]
                }],
                labels: label
              },
              options: {
                legend: {
                  position: 'top',
                  labels: {
                    fontFamily: 'Poppins'
                  }

                },
                responsive: true
              }
          });
          }).catch( function(result){
            console.log(result);
          });
      
    }
  } catch (error) {
    console.log(error);
  }


  try {

    //pie chart
    var ctx3 = document.getElementById("genderChart");
    if (ctx3) {
      var params = {
      };
      var body = {
        'q': 'SELECT COUNT(*) AS COUNT,\
              GENDER\
              FROM ssaretail_instore_demo_processed\
              GROUP BY  GENDER'
      };    

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            console.log(parsed)
            // console.log(parsed['data'][0]);
            var value = [];
            var label = [];
            for (var i=0; i < parsed['data'].length; i++) {
               // var person = [parsed[i].name, parsed[i].place, parsed[i].phone];
               value.push(Number(parsed['data'][i].COUNT))
               label.push(parsed['data'][i].GENDER)
            }
            // console.log(value)
            // console.log(label)
            // console.log(ctx3)


      ctx3.height = 200;
      var myChart = new Chart(ctx3, {
        type: 'pie',
        data: {
          datasets: [{
            data: value,
            backgroundColor: [
              "rgba(0, 123, 255,0.9)",
              // "rgba(0, 123, 255,0.7)",
              // "rgba(0, 123, 255,0.5)",
              "rgba(0,0,0,0.07)"
            ],
            hoverBackgroundColor: [
              "rgba(0, 123, 255,0.9)",
              // "rgba(0, 123, 255,0.7)",
              // "rgba(0, 123, 255,0.5)",
              "rgba(0,0,0,0.07)"
            ]

          }],
          labels: label
        },
        options: {
          legend: {
            position: 'top',
            labels: {
              fontFamily: 'Poppins'
            }

          },
          responsive: true
        }
      }); // end apig after this
      }).catch( function(result){
        console.log(result);
      });



//Add apig before this

    }


  } catch (error) {
    console.log(error);
  }

  try {

    // polar chart
    var ctx = document.getElementById("polarChart");
    if (ctx) {
      ctx.height = 200;
      var myChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
          datasets: [{
            data: [15, 18, 9, 6, 19],
            backgroundColor: [
              "rgba(0, 123, 255,0.9)",
              "rgba(0, 123, 255,0.8)",
              "rgba(0, 123, 255,0.7)",
              "rgba(0,0,0,0.2)",
              "rgba(0, 123, 255,0.5)"
            ]

          }],
          labels: [
            "Green",
            "Green",
            "Green",
            "Green"
          ]
        },
        options: {
          legend: {
            position: 'top',
            labels: {
              fontFamily: 'Poppins'
            }

          },
          responsive: true
        }
      });
    }

  } catch (error) {
    console.log(error);
  }

  try {

    // single bar chart
    var ctx2 = document.getElementById("singelBarChart");
    if (ctx2) {
      var params = {
      };
      var body = {
        'q': 'WITH BINS AS (SELECT CASE WHEN round((agerangemin+agerangemax)/2)>= 0 AND round((agerangemin+agerangemax)/2) <= 15 THEN \'0 - 15\' WHEN round((agerangemin+agerangemax)/2)>= 16 AND round((agerangemin+agerangemax)/2) <= 25 THEN \'16 - 25\' WHEN round((agerangemin+agerangemax)/2)>= 26 AND round((agerangemin+agerangemax)/2) <= 35 THEN \'26 - 35\' WHEN round((agerangemin+agerangemax)/2)>= 36 AND round((agerangemin+agerangemax)/2) <= 50 THEN \'36 - 50\' WHEN round((agerangemin+agerangemax)/2)>= 51 AND round((agerangemin+agerangemax)/2) <= 65 THEN \'51 - 65\' ELSE \'65 ABOVE\' END AS AGE_GROUPS,from_unixtime(retailtimestamp) FROM ssaretail_instore_demo_processed) SELECT COUNT(AGE_GROUPS) AS COUNTS,AGE_GROUPS FROM BINS GROUP BY AGE_GROUPS ORDER BY CASE WHEN AGE_GROUPS = \'0 - 15\' THEN \'1\' WHEN AGE_GROUPS = \'16 - 25\' THEN \'2\' WHEN AGE_GROUPS = \'26 - 35\' THEN \'3\' WHEN AGE_GROUPS = \'36 - 50\' THEN \'4\' WHEN AGE_GROUPS = \'51 - 65\' THEN \'5\' WHEN AGE_GROUPS = \'65 ABOVE\' THEN \'6\' END ASC'
      };  

      apigClient.queryPost(params, body)
          .then(function(result){
            console.log('success OK');
            // console.log(JSON.parse(result.data.body));
            var parsed = JSON.parse(result.data.body);
            console.log(parsed)
            // console.log(parsed['data'][0]);
            var value = [];
            var label = [];
            for (var i=0; i < parsed['data'].length; i++) {
               // var person = [parsed[i].name, parsed[i].place, parsed[i].phone];
               value.push(Number(parsed['data'][i].COUNTS))
               label.push(parsed['data'][i].AGE_GROUPS)
            }
            // console.log(value)
            // console.log(label)

            ctx2.height = 200;
            var myChart = new Chart(ctx2, {
              type: 'bar',
              data: {
                labels: label,
                datasets: [
                  {
                    label: "Count of People",
                    data: value,
                    borderColor: "rgba(0, 123, 255, 0.9)",
                    borderWidth: "0",
                    backgroundColor: "rgba(0, 123, 255, 0.5)"
                  }
                ]
              },
              options: {
                legend: {
                  position: 'top',
                  labels: {
                    fontFamily: 'Poppins'
                  }

                },
                scales: {
                  xAxes: [{
                    ticks: {
                      fontFamily: "Poppins"

                    }
                  }],
                  yAxes: [{
                    ticks: {
                      beginAtZero: true,
                      fontFamily: "Poppins"
                    }
                  }]
                }
              }
            });
            }).catch( function(result){
            console.log(result);
          });
    }

  } catch (error) {
    console.log(error);
  }

 try{
  var timeFormat = 'MM/DD/YYYY HH:mm';
  var color = Chart.helpers.color;
  var ctx = document.getElementById("newLineChart");
  if (ctx) {
    ctx.height = 150;
    var myChart = new Chart(ctx, {
      type: 'line',
			data: {
				labels: ["25 Jan", "26 Jan", "27 Jan", "28 Jan", "29 Jan", "30 Jan", "31 Jan"],
				datasets: [{
					label: 'My First dataset',
					backgroundColor: "rgba(0, 123, 255, 0.9)",
					borderColor: "rgba(0, 123, 255, 0.9)",
					fill: false,
					data: [
						1,2,3,4,5,6,7
					]
				}, {
					label: 'My Second dataset',
					backgroundColor: "rgba(0, 123, 255, 0.1)",
					borderColor: "rgba(0, 123, 255, 0.1)",
					fill: false,
					data: [
						2,4,6,8,10,12,14
					],
				}, {
					label: 'Dataset with point data',
					backgroundColor: "rgba(0, 123, 255, 0.9)",
					borderColor: "rgba(0, 123, 255, 0.9)",
					fill: false,
					data: [{
						x: 2,
						y: 10
					}, {
						x: 3,
						y: 9
					}, {
						x: 4,
						y: 16
					}, {
						x: 5,
						y: 25
					}],
				}]
			},
			options: {
				title: {
					text: 'Chart.js Time Scale'
				},
				scales: {
					xAxes: [{
						type: 'time',
						time: {
							parser: timeFormat,
							// round: 'day'
							tooltipFormat: 'll HH:mm'
						},
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'value'
						}
					}]
				},
			}
    });
  }
  } catch (error) {
      console.log(error);
  }
})(jQuery);



(function ($) {
    // USE STRICT
    "use strict";
    $(".animsition").animsition({
      inClass: 'fade-in',
      outClass: 'fade-out',
      inDuration: 900,
      outDuration: 900,
      linkElement: 'a:not([target="_blank"]):not([href^="#"]):not([class^="chosen-single"])',
      loading: true,
      loadingParentElement: 'html',
      loadingClass: 'page-loader',
      loadingInner: '<div class="page-loader__spin"></div>',
      timeout: false,
      timeoutCountdown: 5000,
      onLoadEvent: true,
      browser: ['animation-duration', '-webkit-animation-duration'],
      overlay: false,
      overlayClass: 'animsition-overlay-slide',
      overlayParentElement: 'html',
      transition: function (url) {
        window.location.href = url;
      }
    });


  })(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Map
  try {

    var vmap = $('#vmap');
    if(vmap[0]) {
      vmap.vectorMap( {
        map: 'world_en',
        backgroundColor: null,
        color: '#ffffff',
        hoverOpacity: 0.7,
        selectedColor: '#1de9b6',
        enableZoom: true,
        showTooltip: true,
        values: sample_data,
        scaleColors: [ '#1de9b6', '#03a9f5'],
        normalizeFunction: 'polynomial'
      });
    }

  } catch (error) {
    console.log(error);
  }

  // Europe Map
  try {

    var vmap1 = $('#vmap1');
    if(vmap1[0]) {
      vmap1.vectorMap( {
        map: 'europe_en',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        enableZoom: true,
        showTooltip: true
      });
    }

  } catch (error) {
    console.log(error);
  }

  // USA Map
  try {

    var vmap2 = $('#vmap2');

    if(vmap2[0]) {
      vmap2.vectorMap( {
        map: 'usa_en',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        enableZoom: true,
        showTooltip: true,
        selectedColor: null,
        hoverColor: null,
        colors: {
            mo: '#001BFF',
            fl: '#001BFF',
            or: '#001BFF'
        },
        onRegionClick: function ( event, code, region ) {
            event.preventDefault();
        }
      });
    }

  } catch (error) {
    console.log(error);
  }

  // Germany Map
  try {

    var vmap3 = $('#vmap3');
    if(vmap3[0]) {
      vmap3.vectorMap( {
        map: 'germany_en',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        onRegionClick: function ( element, code, region ) {
            var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();

            alert( message );
        }
      });
    }

  } catch (error) {
    console.log(error);
  }

  // France Map
  try {

    var vmap4 = $('#vmap4');
    if(vmap4[0]) {
      vmap4.vectorMap( {
        map: 'france_fr',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        enableZoom: true,
        showTooltip: true
      });
    }

  } catch (error) {
    console.log(error);
  }

  // Russia Map
  try {
    var vmap5 = $('#vmap5');
    if(vmap5[0]) {
      vmap5.vectorMap( {
        map: 'russia_en',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        hoverOpacity: 0.7,
        selectedColor: '#999999',
        enableZoom: true,
        showTooltip: true,
        scaleColors: [ '#C8EEFF', '#006491' ],
        normalizeFunction: 'polynomial'
      });
    }


  } catch (error) {
    console.log(error);
  }

  // Brazil Map
  try {

    var vmap6 = $('#vmap6');
    if(vmap6[0]) {
      vmap6.vectorMap( {
        map: 'brazil_br',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        onRegionClick: function ( element, code, region ) {
            var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();
            alert( message );
        }
      });
    }

  } catch (error) {
    console.log(error);
  }
})(jQuery);
(function ($) {
  // Use Strict
  "use strict";
  try {
    var progressbarSimple = $('.js-progressbar-simple');
    progressbarSimple.each(function () {
      var that = $(this);
      var executed = false;
      $(window).on('load', function () {

        that.waypoint(function () {
          if (!executed) {
            executed = true;
            /*progress bar*/
            that.progressbar({
              update: function (current_percentage, $this) {
                $this.find('.js-value').html(current_percentage + '%');
              }
            });
          }
        }, {
            offset: 'bottom-in-view'
          });

      });
    });
  } catch (err) {
    console.log(err);
  }
})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Scroll Bar
  try {
    var jscr1 = $('.js-scrollbar1');
    if(jscr1[0]) {
      const ps1 = new PerfectScrollbar('.js-scrollbar1');
    }

    var jscr2 = $('.js-scrollbar2');
    if (jscr2[0]) {
      const ps2 = new PerfectScrollbar('.js-scrollbar2');

    }

  } catch (error) {
    console.log(error);
  }

})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Select 2
  try {

    $(".js-select2").each(function () {
      $(this).select2({
        minimumResultsForSearch: 20,
        dropdownParent: $(this).next('.dropDownSelect2')
      });
    });

  } catch (error) {
    console.log(error);
  }


})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Dropdown
  try {
    var menu = $('.js-item-menu');
    var sub_menu_is_showed = -1;

    for (var i = 0; i < menu.length; i++) {
      $(menu[i]).on('click', function (e) {
        e.preventDefault();
        $('.js-right-sidebar').removeClass("show-sidebar");
        if (jQuery.inArray(this, menu) == sub_menu_is_showed) {
          $(this).toggleClass('show-dropdown');
          sub_menu_is_showed = -1;
        }
        else {
          for (var i = 0; i < menu.length; i++) {
            $(menu[i]).removeClass("show-dropdown");
          }
          $(this).toggleClass('show-dropdown');
          sub_menu_is_showed = jQuery.inArray(this, menu);
        }
      });
    }
    $(".js-item-menu, .js-dropdown").click(function (event) {
      event.stopPropagation();
    });

    $("body,html").on("click", function () {
      for (var i = 0; i < menu.length; i++) {
        menu[i].classList.remove("show-dropdown");
      }
      sub_menu_is_showed = -1;
    });

  } catch (error) {
    console.log(error);
  }

  var wW = $(window).width();
    // Right Sidebar
    var right_sidebar = $('.js-right-sidebar');
    var sidebar_btn = $('.js-sidebar-btn');

    sidebar_btn.on('click', function (e) {
      e.preventDefault();
      for (var i = 0; i < menu.length; i++) {
        menu[i].classList.remove("show-dropdown");
      }
      sub_menu_is_showed = -1;
      right_sidebar.toggleClass("show-sidebar");
    });

    $(".js-right-sidebar, .js-sidebar-btn").click(function (event) {
      event.stopPropagation();
    });

    $("body,html").on("click", function () {
      right_sidebar.removeClass("show-sidebar");

    });


  // Sublist Sidebar
  try {
    var arrow = $('.js-arrow');
    arrow.each(function () {
      var that = $(this);
      that.on('click', function (e) {
        e.preventDefault();
        that.find(".arrow").toggleClass("up");
        that.toggleClass("open");
        that.parent().find('.js-sub-list').slideToggle("250");
      });
    });

  } catch (error) {
    console.log(error);
  }


  try {
    // Hamburger Menu
    $('.hamburger').on('click', function () {
      $(this).toggleClass('is-active');
      $('.navbar-mobile').slideToggle('500');
    });
    $('.navbar-mobile__list li.has-dropdown > a').on('click', function () {
      var dropdown = $(this).siblings('ul.navbar-mobile__dropdown');
      $(this).toggleClass('active');
      $(dropdown).slideToggle('500');
      return false;
    });
  } catch (error) {
    console.log(error);
  }
})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Load more
  try {
    var list_load = $('.js-list-load');
    if (list_load[0]) {
      list_load.each(function () {
        var that = $(this);
        that.find('.js-load-item').hide();
        var load_btn = that.find('.js-load-btn');
        load_btn.on('click', function (e) {
          $(this).text("Loading...").delay(1500).queue(function (next) {
            $(this).hide();
            that.find(".js-load-item").fadeToggle("slow", 'swing');
          });
          e.preventDefault();
        });
      })

    }
  } catch (error) {
    console.log(error);
  }

})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  try {

    $('[data-toggle="tooltip"]').tooltip();

  } catch (error) {
    console.log(error);
  }

  // Chatbox
  try {
    var inbox_wrap = $('.js-inbox');
    var message = $('.au-message__item');
    message.each(function(){
      var that = $(this);

      that.on('click', function(){
        $(this).parent().parent().parent().toggleClass('show-chat-box');
      });
    });


  } catch (error) {
    console.log(error);
  }

})(jQuery);
