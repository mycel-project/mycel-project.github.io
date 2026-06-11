# Auth Error Reference

## Authentication Errors (401)

### invalid_token

The token provided is not valid. This can happen if the token was copied incorrectly or has been replaced.

Recommended user message:
```
Your MycelCloud token is invalid. Please visit mycelcloud.com to generate a new one.
```

### token_expired

The token has not been used for too long and has expired.

Recommended user message:
```
Your MycelCloud token has expired. Please visit mycelcloud.com to generate a new one.
```

### missing_token

No token was found in the configuration. Mycel cannot connect to MycelCloud without one.

Recommended user message:
```
No MycelCloud token is configured. Please visit mycelcloud.com to get your token, then add it to your configuration.
```

You may also offer to open the configuration directly so the user can paste it in without leaving your interface.

## Subscription Error (402)

### not_subscribed

The account associated with this token does not have an active subscription.

Recommended user message:
```
Your MycelCloud subscription is inactive. Please visit mycelcloud.com to update your subscription.
```

## Service Error (503)

### service_unavailable

MycelCloud could not be reached or is temporarily unavailable. This is not an issue with your token or subscription.

Recommended user message:
```
MycelCloud is temporarily unavailable. Please try again in a few moments.
```
