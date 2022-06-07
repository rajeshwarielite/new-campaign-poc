
import { environment } from 'src/environments/environment';
import $ from 'jquery';

var props = {
    qlik: {}
}
var config = environment.QLIK_CONFIG;
var appId = environment.APP_ID;

var chart_id = {
    'Mobile Message': 'jpgcbe',
    'CSV Download': 'LeLMuB',
    'Facebook': 'Lvtqh'
}
// export function getSegmentList(app) {
//     return new Promise((resolve, reject) => {
//         try {
//             app.getList('BookmarkList', function (reply) {
//                 let list = reply.qBookmarkList.qItems, newList = [];
//                 newList = list.map((ele, i) => {
//                     let segment = {}, title;
//                     segment.segmentId = ele.qInfo.qId;
//                     segment.segmentName = ele.qData.title
//                     if (segment.segmentName && segment.segmentName.includes('InfoXD')) {
//                         title = segment.segmentName.split('~');
//                         segment.segmentName = title[1];
//                         segment.segmentType = title[2];
//                         segment.subscriberCount = {};//                         
//                         return segment;
//                     }
//                 })
//                 newList = newList.filter(ele => ele !== undefined)
//                 resolve(newList);
//             })
//         }
//         catch (error) {
//             reject(error);
//         }
//     })
// }
export function getSegmentList(app) {
    return new Promise((resolve, reject) => {
        try {
            let Genericid = null;
            app.getList('BookmarkList', function (reply) {
                let list = reply.qBookmarkList.qItems, newList = [];
                newList = list.map((ele, i) => {
                    let segment = {}, title;
                    segment.segmentId = ele.qInfo.qId;
                    segment.segmentName = ele.qData.title;
                    if (segment.segmentName && segment.segmentName.includes('InfoXD')) {
                        title = segment.segmentName.split('~');
                        segment.segmentName = title[1];
                        segment.segmentType = title[2];
                        segment.subscriberCount = {};
                        app.createGenericObject({
                            subscriber_count: { qStringExpression: "$(=replace(vSubscriber_Count,'{$','{'&chr(39)& '" + segment.segmentId + "' &chr(39)))" }
                        }, function (reply) {
                            if (reply) {
                                segment.subscriberCount = +reply.subscriber_count.replace(',', '')
                                Genericid = reply.qInfo.qId
                            }
                        })
                        return segment;
                    }
                })
                newList = newList.filter(ele => ele !== undefined)
                app.destroySessionObject(Genericid)
                resolve(newList);
            })
        }
        catch (error) {
            reject(error);
        }
    })
}
export function getRecommendedSegments(app) {
    return new Promise((resolve, reject) => {
        try {
            app.createCube({
                "qInitialDataFetch": [
                    {
                        "qHeight": 20,
                        "qWidth": 3
                    }
                ],
                "qDimensions": [
                    {
                        "qDef": {
                            "qFieldDefs": [
                                "=Primary_Seg_Name"
                            ]
                        },
                        "qNullSuppression": true,
                        "qOtherTotalSpec": {
                            "qOtherMode": "OTHER_OFF",
                            "qSuppressOther": true,
                            "qOtherSortMode": "OTHER_SORT_DESCENDING",
                            "qOtherCounted": {
                                "qv": "5"
                            },
                            "qOtherLimitMode": "OTHER_GE_LIMIT"
                        }
                    },
                    {
                        "qDef": {
                            "qFieldDefs": [
                                "=Upsell_Category"
                            ]
                        },
                        "qNullSuppression": true,
                        "qOtherTotalSpec": {
                            "qOtherMode": "OTHER_OFF",
                            "qSuppressOther": true,
                            "qOtherSortMode": "OTHER_SORT_DESCENDING",
                            "qOtherCounted": {
                                "qv": "5"
                            },
                            "qOtherLimitMode": "OTHER_GE_LIMIT"
                        }
                    }
                ],
                "qMeasures": [
                    {
                        "qDef": {
                            "qDef": "$(vSubscribers_Recommended)"
                        },
                        "qLabel": "$(vSubscribers_Recommended)",
                        "qLibraryId": null,
                        "qSortBy": {
                            "qSortByState": 0,
                            "qSortByFrequency": 0,
                            "qSortByNumeric": 0,
                            "qSortByAscii": 1,
                            "qSortByLoadOrder": 0,
                            "qSortByExpression": 0,
                            "qExpression": {
                                "qv": " "
                            }
                        }
                    }
                ],
                "qSuppressZero": false,
                "qSuppressMissing": false,
                "qMode": "S",
                "qInterColumnSortOrder": [],
                "qStateName": "$"
            }, (reply) => {
                let arr = [], segments = [];
                arr = reply.qHyperCube.qDataPages[0].qMatrix.map(ele => {
                    let arr1 = [];
                    arr1 = ele.map(val => val.qText)
                    return arr1
                });
                // console.log(arr);
                segments = arr.map(ele => {
                    let obj = {}
                    obj.segmentName = ele[0];
                    obj.segmentType = ele[1];
                    obj.subscriberCount = +ele[2].replace(',', '');
                    return obj;
                })
                // console.log(segments)
                resolve(segments)
            });
        }
        catch (error) {
            reject(error);
        }
    })
}

export function downloadQSReports(app, type) {

    return new Promise((resolve, reject) => {
        try {
            app.visualization.get(chart_id[type]).then(function (vis) {
                vis.exportData({ format: 'CSV_C' }).then(function (link) {
                    window.open(link);
                    resolve();
                });
            });
        }
        catch (error) {
            reject(error)
        }
    })
}
export function downloadCSVSegmentFilters(segment_id, segment_type, filters, app) {

    return new Promise((resolve, reject) => {
        if (segment_type === 'Saved') {
            app.bookmark.apply(segment_id);
            resolve()
        }
        else if (segment_type === 'Recommended') {
            app.field('Recommended_UUID').selectMatch(segment_id);
            if (filters && filters.region) {
                let values = filters.region.split(';');
                app.field('region').selectValues([...values]);
            }
            if (filters && filters.location) {
                let values = filters.location.split(';');
                app.field('location').selectValues([...values]);
            }
            if (filters && filters.servicegrp) {
                let values = filters.servicegrp.split(';');
                app.field('servicegrp').selectValues([...values]);
            }
            if (filters && filters.propensity) {
                let values = filters.propensity.split(';');
                app.field('propensity').selectValues([...values]);
            }

            if (filters && filters.zipcode) {
                let values = filters.zipcode.split(';'), intValues = [...values].map(val => parseInt(val));
                app.field('zipcode').selectValues([...intValues]);

            }

            if (filters && filters.zipplusfour) {

                let values = filters.zipplusfour.split(';'), intValues = [...values].map(val => parseInt(val));

                app.field('zipplusfour').selectValues([...intValues]);

            }

            resolve();
        }
        else {
            reject('Invalid Segment Type')
        }
    })
}
export function getRecommendedSegmentAdditionalFilters(app, obj_id) {
    return new Promise((resolve, reject) => {
        app.getObject(obj_id).then(model => {
            let field = model.layout.qHyperCube.qDimensionInfo[0].qFallbackTitle;
            //    console.log(field)
            model.getHyperCubeData('/qHyperCubeDef', [{
                qTop: 0,
                qLeft: 0,
                qWidth: 2,
                qHeight: 5000
            }]).then(data => {
                let list = data[0].qMatrix, finalList = [], result = {};
                finalList = [...list].map(elem => {
                    let obj = {};
                    obj[field] = elem[0].qText;
                    return obj
                })
                result = {
                    "message": "Successfully initiated",
                    "data": finalList
                }
                console.log(result);
                //  model.close();
                resolve(result)
            })
        })
    })
}
export function getHomeInsightsKPI(app) {
    return new Promise((resolve, reject) => {
        app.createGenericObject({
            All_Subscribers: { qStringExpression: "=${vTotalSubscribers}" },
            All_Subscribers_Percentage: { qStringExpression: "=${vTotalSubscribersPercentage}" },
            Streaming_Subscribers: { qStringExpression: "=${vStreaming}" },
            Streaming_Subscribers_Percentage: { qStringExpression: "=${vStreamingSubscribersPercentage}" },
            Gaming_Subscribers: { qStringExpression: "=${vGaming}" },
            Gaming_Subscribers_Percentage: { qStringExpression: "=${vGamingSubscribersPercentage}" },
            Work_From_Home_Subscribers: { qStringExpression: "=${vWFH}" },
            Work_From_Home_Subscribers_Percentage: { qStringExpression: "=${vWFHSubscribersPercentage}" },
            Acquisition_Rate: { qStringExpression: "=${vAcquisitionRate}" },
            Acquisition_Rate_Percentage: { qStringExpression: "=${vAcquisitionRatePercentage}" },
            Churn_Rate: { qStringExpression: "=${vChurnRate}" },
            Churn_Rate_Percentage: { qStringExpression: "=${vChurnRatePercentage}" },
            ARPU: { qStringExpression: "=${vARPU}" },
            ARPU_Percentage: { qStringExpression: "=${vARPUPercentage}" },
            New_Subscribers_Per_Day: { qStringExpression: "=${vNewSubsPerDay}" },
            New_Subscribers_Per_Day_Percentage: { qStringExpression: "=${vNewSubsPerDayPercentage}" }
        }, function (reply) {
            if (reply) {
                resolve(reply)
            }
        })
    })
}
export function getSegmentSize(app) {
    return new Promise((resolve, reject) => {
        try {
            app.createCube({
                "qInitialDataFetch": [
                    {
                        "qHeight": 20,
                        "qWidth": 3
                    }
                ],
                "qDimensions": [
                    {
                        "qDef": {
                            "qFieldDefs": [
                                "=$(vSerialNumber)"
                            ]
                        },
                        "qNullSuppression": true,
                        "qOtherTotalSpec": {
                            "qOtherMode": "OTHER_OFF",
                            "qSuppressOther": true,
                            "qOtherSortMode": "OTHER_SORT_DESCENDING",
                            "qOtherCounted": {
                                "qv": "5"
                            },
                            "qOtherLimitMode": "OTHER_GE_LIMIT"
                        }
                    },
                    {
                        "qDef": {
                            "qFieldDefs": [
                                "=$(vChannelName)"
                            ]
                        },
                        "qNullSuppression": true,
                        "qOtherTotalSpec": {
                            "qOtherMode": "OTHER_OFF",
                            "qSuppressOther": true,
                            "qOtherSortMode": "OTHER_SORT_DESCENDING",
                            "qOtherCounted": {
                                "qv": "5"
                            },
                            "qOtherLimitMode": "OTHER_GE_LIMIT"
                        }
                    }
                ],
                "qMeasures": [
                    {
                        "qDef": {
                            "qDef": "$(vSegmentSize)"
                        },
                        "qLabel": "$(vSegmentSize)",
                        "qLibraryId": null,
                        "qSortBy": {
                            "qSortByState": 0,
                            "qSortByFrequency": 0,
                            "qSortByNumeric": 0,
                            "qSortByAscii": 1,
                            "qSortByLoadOrder": 0,
                            "qSortByExpression": 0,
                            "qExpression": {
                                "qv": " "
                            }
                        }
                    }
                ],
                "qSuppressZero": false,
                "qSuppressMissing": false,
                "qMode": "S",
                "qInterColumnSortOrder": [],
                "qStateName": "$"
            }, (reply) => {
                let returnArray = []
                reply.qHyperCube.qDataPages[0].qMatrix.forEach(el => {
                    let mapping = el.map(el => el.qText);
                    let returnObject = {
                        serialNo: mapping[0],
                        channelName: mapping[1],
                        segmentSize: mapping[2]
                    }
                    returnArray.push(returnObject)
                });
                resolve(returnArray)
            });
        }
        catch (error) {
            reject(error);
        }
    })
}
function initQlikConnection(baseUrl, qlikTicket) {
    let checkFile;
    return new Promise((resolve, reject) => {
        try {
            if (checkFile || document.getElementById('loadJSCSSFile')) {
                // resolve(checkFile);
                // document.getElementById('loadJSCSSFile').remove();
            }
            // window.onload();

            if (!document.getElementById('loadJSCSSFile')) {
                const jsFileLoad = document.createElement('script');
                jsFileLoad.src = `${baseUrl}/assets/external/requirejs/require.js?qlikTicket=${qlikTicket}`;
                jsFileLoad.id = 'loadJSCSSFile';
                document.head.appendChild(jsFileLoad);
                jsFileLoad.loaded = new Promise((resolve, reject) => {
                    jsFileLoad.onload = () => {
                        resolve();
                    };
                    jsFileLoad.onerror = () => {
                        reject();
                    };
                });
                checkFile = Promise.all([jsFileLoad.loaded])
                resolve(checkFile);
            }

            // const cssFileLoad = document.createElement('link');
            // cssFileLoad.href = `${baseUrl}/autogenerated/qlik-styles.css`;
            // cssFileLoad.type = 'text/css';
            // cssFileLoad.rel = 'stylesheet';
            // document.head.appendChild(cssFileLoad);
            // cssFileLoad.loaded = new Promise((resolve, reject) => {
            //   cssFileLoad.onload = () => {
            //     resolve();
            //   };
            //   cssFileLoad.onerror = () => {
            //     reject();
            //   };
            // });
            // checkFile = Promise.all([jsFileLoad.loaded, cssFileLoad.loaded])

        } catch (error) {
            reject(error);
        }
    })
};
export function openQlikConnection(qlikTicket) {
    config = environment.QLIK_CONFIG;
    console.log('APP OPENING', qlikTicket)
    var url = `${(config.isSecure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + config.prefix}resources`;
    return new Promise((resolve, reject) => {
        try {
            initQlikConnection(url, qlikTicket).then((res) => {
                window.require.config({
                    baseUrl: url,
                    paths: {
                        qlik: `${url}/js/qlik?qlikTicket=${qlikTicket}`,
                    },
                    config: {
                        text: {
                            useXhr() {
                                return true;
                            }
                        }
                    }
                });

                window.require(["js/qlik"], function (qlik) {
                    qlik.setOnError(function (error) {
                        // console.log('APP OPENING', error)

                        // reject(error)
                    })
                    props["qlik"] = qlik;
                    console.log('APP OPENING', qlik)

                    resolve(qlik);

                });
            })
        }
        catch (error) {
            reject(error)
        }
    })
}
export function openApp() {
    appId = environment.APP_ID;
    return new Promise((resolve, reject) => {
        try {
            const { qlik } = props;
            var app = qlik.openApp(appId, config);
            resolve(app);
        }
        catch (error) {
            reject(error)
        }
    })
}
export function qlikLogout() {
    config = environment.QLIK_CONFIG;
    const URL = `${config.isSecure ? 'https://' : 'http://'}${config.host}${config.port ? ':' + config.port : ''}${config.prefix}qps/user`;
    $.ajax({
        type: 'DELETE',
        url: URL,
        success: function (data) {
            //window.location.reload(true)
        }
    });
}





















// 


