import { google } from 'googleapis';
import dotenv from 'dotenv';
import twilio from 'twilio';
import fs from 'fs';
dotenv.config();

const { TWILIOSID, TWILIOAUTHTOKEN, GOOGLECX, GOOGLEAPIKEY } = process.env

twilio(TWILIOSID, TWILIOAUTHTOKEN);

const { MessagingResponse } = twilio.twiml;
const customsearch = google.customsearch('v1');

export default class WhatsappBot {
    /**
     * @memberof WhatsappBot
     * @param {object} req - Request sent to the route
     * @param {object} res - Response sent from the controller
     * @param {object} next - Error handler
     * @returns {object} - object representing response message
     */
    static async googleSearch(req, res, next) {
    
      const twiml = new MessagingResponse();
      const { Body: searchParam } = req.body;
      const searchParamArr = searchParam? searchParam.split(" ") : []
      let rawStocksData = fs.readFileSync('src/stocks.json')

  
      try {
        switch(searchParamArr[0]){
            // Saving a new stock to the list
            case '#save':
                searchParamArr.shift()
                let stocksData = JSON.parse(rawStocksData)
                let newParamString = searchParamArr.join(" ")
                stocksData.stocks.push(newParamString)
                // console.log(stocksData, searchParamArr)

                let stringifiedStocksData = JSON.stringify(stocksData, null, 2)
                fs.writeFileSync('src/stocks.json', stringifiedStocksData)
                twiml.message(`You have added ${newParamString} to the list. \nNew list: ${stocksData.stocks.join(", ")}`)

                res.set('Content-Type', 'text/xml');
                return res.status(200).send(twiml.toString());

            case '#list':
                let stocksData = JSON.parse(rawStocksData)
                twiml.message(`The stocks you're watching are ${stocksData.stocks.join(", ")}`)    
                res.set('Content-Type', 'text/xml');
                return res.status(200).send(twiml.toString());

            case '#menu':
                twiml.message(
                    `Features still limited. PRs acceptable! \n#menu: To get the menu list. 
                    \n#search 'phrase': to get top five results of the search. \n#list: To get list of stocks you're watching. 
                    \n#save 'stock': To add a stock to your list. \nBonus: You get news about your stocks daily.`
                )
                res.set('Content-Type', 'text/xml');
                return res.status(200).send(twiml.toString());

            case '#search':
                searchParamArr.shift()
                let newParamString = searchParamArr.join(" ")
                const options = { cx: GOOGLECX, q: newParamString, auth: GOOGLEAPIKEY };
                const result = await customsearch.cse.list(options);
                const allResult = result.data.items;
                let messageToSend = ""
    
                allResult.slice(0, 5).forEach((item) => {
                    messageToSend = `${item.snippet} ${item.link} \n`
                    twiml.message(messageToSend)
                })
                    
                res.set('Content-Type', 'text/xml');
            
                return res.status(200).send(twiml.toString());
        }
      } catch (error) {
        return next(error);
      }
    }
}
