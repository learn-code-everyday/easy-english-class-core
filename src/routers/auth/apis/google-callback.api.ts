import { Request, Response } from "express";
import axios from "axios";
import {configs} from '../../../configs';
import {customerService} from "../../../graphql/modules/customer/customer.service";

export const GoogleCallback = async (req: Request, res: Response): Promise<any> => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Authorization code is missing");
  }

  try {
    const redirectUri = `${configs.protocol}://${configs.host}/api/google/callback`;
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: configs.googleClientId,
      client_secret: configs.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });
    const { access_token } = tokenResponse?.data;
    const customer = await customerService.loginGoogle(access_token);
    const {token} = customer;
    return res.redirect(`${configs.domainFe}/auth-callback?token=${token}`);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return res.status(500).send('Authentication failed');
  }
};
