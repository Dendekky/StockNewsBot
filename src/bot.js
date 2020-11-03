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
      const searchParam = req.body.Body;
      const options = { cx: GOOGLECX, q: searchParam, auth: GOOGLEAPIKEY };
      const searchParamArr = searchParam.split(" ")
      let rawStocksData = fs.readFileSync('src/stocks.json')

  
      try {
        // Saving a new stock to the list
        if (searchParamArr[0] === "#save") {
            searchParamArr.shift()
            let stocksData = JSON.parse(rawStocksData)
            let newParamString = searchParamArr.join(" ")
            stocksData.stocks.push(newParamString)
            // console.log(stocksData, searchParamArr)

            let stringifiedStocksData = JSON.stringify(stocksData, null, 2)
            fs.writeFileSync('src/stocks.json', stringifiedStocksData)
            twiml.message(`You have added ${newParamString} to the list. \n New list: ${stocksData.stocks.join(", ")}`)

            res.set('Content-Type', 'text/xml');
            return res.status(200).send(twiml.toString());
        }

        // Search Function
        const result = await customsearch.cse.list(options);
        // console.log(result.data.items)
        const allResult = result.data.items;
        let messageToSend = ""

        allResult.forEach((item) => {
            messageToSend += `${item.snippet} ${item.link} \n`
        })
        // const searchData = firstResult.snippet;
        // const link = firstResult.link;
  
        twiml.message(messageToSend);
  
        res.set('Content-Type', 'text/xml');
    
        // return res.status(200).send({ data: allResult})
        return res.status(200).send(twiml.toString());
      } catch (error) {
        return next(error);
      }
    }
}
