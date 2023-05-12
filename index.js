const fetch = require('node-fetch');

const configs = {
    workspace: '',
    baseUrl: '',
    secretKey: '',
    contentType: 'application/json'
}

module.exports.setConfig = ({workspace='', baseUrl='', secretKey='', contentType='application/json'}) => {
    configs.workspace = workspace
    configs.baseUrl = baseUrl
    configs.secretKey = secretKey
    configs.contentType = contentType
}

module.exports.middleware = () => {
    return async (req, res, next) => {
        try {
            const payload = {
                request: {
                    "headerParams": {},
                    "formParams": {},
                    "verb": "",
                    "path": "",
                    "hostname": "",
                    "requestBody": ""
                },
                response: {
                    "headerParams": {},
                    "responseBody": "",
                    "statusCode": ""
                }
            }

            console.log('====================================');
            console.log('configs', configs)
            console.log('====================================');

            payload.request.headerParams = req.headers || {}
            payload.request.formParams = req.params || {}
            payload.request.verb = req.method || {}
            payload.request.path = req.path || {}
            payload.request.hostname = req.headers ? req.headers.host : ''
            payload.request.requestBody = JSON.stringify(req.body || {})
            const oldJson = res.json;
            res.json = async (body) => {

                res.locals.body = body;
                const sample = oldJson.call(res, body)

                payload.response.responseBody = JSON.stringify(body || {})
                payload.response.statusCode = res.statusCode || ''
                payload.response.headerParams = res.getHeaders()
                const baseUrl = configs.baseUrl;

                let headers = {
                    'Content-Type': configs.contentType,
                }

                if (configs.secretKey){
                    headers['x-client-secret'] = configs.secretKey
                }
                if (configs.workspace){
                    headers['x-client-id'] = configs.workspace
                    headers['workspace-id'] = configs.workspace
                }

                const response = await fetch(baseUrl, {
                    method: 'post', headers: {...headers},
                    body: JSON.stringify(payload)
                });

                console.log('====================================');
                console.log(`response`, response);
                console.log('====================================');
            };
            next();
        } catch (error) {
            next(error);
            console.log('====================================');
            console.log(`error`, error);
            console.log('====================================');
        }
    };
};
  