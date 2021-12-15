import axios from "axios";
import { dir } from "console";
import jsSHA from 'jssha';

const appKey = 'tDcYNLoZWpnR-QR7We6-FAIgTE4'
const appID = 'd88637e25cfe4aa1bcfe05495129d1cd'
function getAuthorizationHeader() {
    var GMTString = new Date().toGMTString();
    var ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(appKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    var HMAC = ShaObj.getHMAC('B64');
    var Authorization = 'hmac username=\"' + appID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

    return { 'Authorization': Authorization, 'X-Date': GMTString };
}



//建立要尋找的路線資訊，以便後續Alert Sequence的查找
//route -> 路線名稱
//direction -> 0/去程 1/回程
async function getRouteStop(route, direction) {
    let routeStopInfo = null
    try {
        await axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City/Taipei/${route}?%24filter=Direction%20eq%20${direction}&%24top=100&%24format=JSON`, {
            // axios.get('https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeNearStop/City/Taipei/672?%24filter=Direction%20eq%201&%24top=30&%24format=JSON', {
            headers: getAuthorizationHeader(),
        }).then((response) => {
            const data = response.data
            data.forEach(bus => {
                if (bus.RouteName.Zh_tw === route) routeStopInfo = bus
            });
            if (routeStopInfo === null) throw (`Cannot Find Route:${route} , Please Try again !`)
            // console.log(routeStopInfo);
        })
        return routeStopInfo

    } catch (error) {
        console.log(error);
    }
}

function alert(routeStopInfo, busStop) {

    let stopSequence = null
    routeStopInfo.Stops.forEach(stop => {
        if (stop.StopName.Zh_tw === busStop) {
            console.log('尋找站牌:' + busStop + ' sequence: ', stop.StopSequence);
            stopSequence = stop.StopSequence
        }
    })

    if(stopSequence===null)throw (`Cannot Find Bus Stop:${busStop} , Please Try again !`)

    try {
        // https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeNearStop/City/Taipei/672?%24filter=Direction%20eq%201&%24top=30&%24format=JSON
        axios.get('https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeNearStop/City/Taipei/672?%24filter=Direction%20eq%201&%24top=30&%24format=JSON', {
            headers: getAuthorizationHeader(),
        }).then((response) => {
            // console.log(response.data);
            const data = response.data
            data.forEach(bus => {
                console.log('路線:' + bus.RouteName.Zh_tw + ' 車號:' + bus.PlateNumb, '站牌:', bus.StopName.Zh_tw, 'Sequence', bus.StopSequence);
                //要找的公車站前3~5站
                if (bus.StopSequence <= stopSequence - 3 && bus.StopSequence >= stopSequence - 5) {
                    console.log(`Bingo 672路線 往大鵬新城 -> 車號:[${bus.PlateNumb}] ，距離站牌: ${busStop} ${stopSequence - bus.StopSequence} 站 , 目前位於站牌: ${bus.StopName.Zh_tw}`,);
                }
            });
        })
    } catch (error) {
        console.log(error);
    }

}


const Route = await getRouteStop('672', 1)
// console.log(await getRouteStop('672', 1))
alert(Route, '喬治商職')
setInterval(() => {
    alert(Route, '喬治商職')
}, 10 * 1000);
//test()