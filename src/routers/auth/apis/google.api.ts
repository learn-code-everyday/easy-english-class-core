import {Request, Response} from "express";
import {configs} from '../../../configs';

export const GoogleLogin = async (
    req: Request,
    res: Response
) => {
    const {googleClientId: clientId} = configs;
    const redirectUri = `${configs.protocol}://${configs.host}/api/google/callback`;
    const scope = 'openid profile email';
    const responseType = 'code';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    return res.redirect(authUrl);
}
