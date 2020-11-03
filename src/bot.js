import { google } from 'googleapis';
import dotenv from 'dotenv';
import twilio from 'twilio';
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
        // console.log(req.body)
      const twiml = new MessagingResponse();
      const q = req.body.Body;
      const options = { cx: GOOGLECX, q, auth: GOOGLEAPIKEY };
  
      try {
        const result = await customsearch.cse.list(options);
        console.log(result.data.items)
        const firstResult = result.data.items[0];
        const searchData = firstResult.snippet;
        const link = firstResult.link;
  
        twiml.message(`${searchData} ${link}`);
  
        res.set('Content-Type', 'text/xml');
  
        return res.status(200).send(twiml.toString());
      } catch (error) {
        return next(error);
      }
    }
}
