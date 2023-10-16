import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'
const cert = `-----BEGIN CERTIFICATE-----
MIIDGzCCAgOgAwIBAgIJHkq7zuXSpnuyMA0GCSqGSIb3DQEBCwUAMCsxKTAnBgNV
BAMTIGNsb3VkLWRldi1oYXVkcTI0MDUudXMuYXV0aDAuY29tMB4XDTIzMTAwOTEy
MTczOVoXDTM3MDYxNzEyMTczOVowKzEpMCcGA1UEAxMgY2xvdWQtZGV2LWhhdWRx
MjQwNS51cy5hdXRoMC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
AQCiC0+rFDuJAsnVESIy+iVF1KUgAXyzgmV8y/SQNXgFudF+a8a9uhxpZrO3uiOk
O3ZsQnMkET3lx+sCSYB5DgHOX1KpViJ5xh+3XHf4iWDz4fEuQ8VIWhS+Wev2hQjK
Yc7O7/xOUExwr5g8A3AW2zEaUUjG5n7D8BUbDkitouxincxahDM0GQjYbXDqi9uo
3BneSLGNsxIJkQhCYQvr+/2csVENRXapebICylO5gRvjkcYDXBZfqlavTujmpf+O
RW4xpPKmT4BHc1dMT2jaUmcR+IebcVbcI+rSZ0dE+5oKo8JhWQAAooq0YgcAJlx7
5VHO/0+J46myiv+old6B1cKPAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYD
VR0OBBYEFMlgXgaXxCZNYjlEmaX+NdwO5yHyMA4GA1UdDwEB/wQEAwIChDANBgkq
hkiG9w0BAQsFAAOCAQEAgVfBVyr9SV/GwoAjr6H7P128E9NtCOAcnRIOoUmMCkZU
HPluaoDG+hD23y3YknDDk7CymPx/SdHZa8WCVNZBRktbm5pAn/G+ItOkbfbts7+V
+udpzS1AfTEjzfErLfQVZ2K44/krKo5BFRn4M5g5YvLBOXiJ+eloH8eefNhpUzx7
hQenCYA7v0h1tvguavEh58HBqvEo5WWaZUHbjh2zKW+cMHMWNwqg1KA5Wlsmyn1/
X4rC+Nd9ApYzUVtawnL2Z7gV4F1WYHkWz9ovVsrw0/VnnviNTSeLFLU/8ENxQAL/
X91b5otUjTl2gSJYkq7iyMUulyLEYhkStwwc7HQwKg==
-----END CERTIFICATE-----` 

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
