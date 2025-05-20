import axios from 'axios';
import { configs } from '../configs';

interface VerifyResponse {
    error?: boolean;
    message?: {
        access_token_invalid?: string;
    };
}

interface GoogleProfileResponse {
    error?: boolean;
    message?: {
        access_token_invalid?: string;
    };
    data?: {
        googleId: string;
        name: string;
        email: string;
        avatar: string;
    };
}

export const verifyGoogleToken = async (token: string): Promise<VerifyResponse> => {
    const url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`;
    try {
        const { data: { audience } } = await axios.get(url);

        if (configs.googleClientId !== audience) {
            return {
                error: true,
                message: {
                    access_token_invalid: 'access_token_invalid',
                },
            };
        }

        return {};
    } catch (error) {
        return {
            error: true,
            message: {
                access_token_invalid: 'access_token_invalid',
            },
        };
    }
};

export const getGoogleProfile = async (token: string): Promise<GoogleProfileResponse> => {
    const verify = await verifyGoogleToken(token);

    if (verify.error) {
        return {
            error: true,
            message: { access_token_invalid: 'access_token_invalid' },
        };
    }

    try {
        const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`;
        const { data: { id: googleId, name, email, picture } } = await axios.get(url);
        const avatar = picture.replace('=s96-c', '=s300-c');

        return {
            data: { googleId, name, email, avatar },
        };
    } catch (error) {
        return {
            error: true,
            message: { access_token_invalid: 'access_token_invalid' },
        };
    }
};
