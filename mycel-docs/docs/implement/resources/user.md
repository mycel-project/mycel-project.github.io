# User

## UserView model

See the [UserView Model](https://github.com/mycel-project/mycel/blob/main/src/schemas/user_view.py). 

## Create 

Whether self-hosted or on MycelCloud, your client never needs to 
create a user explicitly — simply fetch it. On a self-hosted instance, 
Mycel creates the default user automatically the first time you 
connect. On MycelCloud, user creation is handled directly by the platform.

!!! note "Only one user"
    For now, Mycel only supports one user per instance. A few 
    modifications are yet to be made to support multiple users, but 
    this won't impact your code — whether on a self-hosted instance or 
    MycelCloud, simply save the returned user data.

## Fetch 

**Required**{: .badge .badge-required}

Once communication with Mycel is initiated, it's time to query user 
info. To reach it, call `GET /users`. It returns the current user's 
ID, [configuration](../configuration.md), and template settings, gathered in a UserView.

??? abstract "GET /users"
	[Scalar](https://api.mycelcloud.com/scalar#tag/users/GET/users) - 
	[Swagger](../../reference/api.md)

## Update

To update user data (name, config, ...), use:

??? abstract "PATCH /users"
    [Scalar](https://api.mycelcloud.com/scalar#tag/users/PATCH/users) - 
    [Swagger](../../reference/api.md)

See [Update Resources Page](./update.md) for more details.

---

Once the user is fetched, you're ready to pull their collections.
