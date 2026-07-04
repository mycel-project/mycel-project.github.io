# Auth Error Reference

This page lists the authentication errors MycelCloud can send, along with what each one means and a recommended message to display to the user. 

## Authentication Errors (401)

### invalid_token

The token provided is not valid. This can happen if the token was copied incorrectly or has been replaced.

Message:
```
Your MycelCloud token is invalid. Please visit mycelcloud.com to generate a new one.
```

### token_expired

The token has not been used for too long and has expired.

Message:
```
Your MycelCloud token has expired. Please visit mycelcloud.com to generate a new one.
```

### missing_token

No token was found in the configuration. Mycel cannot connect to MycelCloud without one.

Message:
```
No MycelCloud token configured. Please visit mycelcloud.com to get your token, then enter it in the dedicated field.
```

You may also offer to open the configuration directly so the user can paste it in without leaving your interface.

## Subscription Error (402)

### not_subscribed

The account associated with this token does not have an active subscription.

Message:
```
Your MycelCloud subscription is inactive. Please visit mycelcloud.com to update your subscription.
```

## Service Error (503)

### service_unavailable

MycelCloud could not be reached or is temporarily unavailable. This is not an issue with your token or subscription.

Message:
```
MycelCloud is temporarily unavailable. Please try again in a few moments.
```
