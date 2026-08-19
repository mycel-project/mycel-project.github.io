# Collection

## CollectionView model

See the [CollectionView Model](https://github.com/mycel-project/mycel/blob/main/src/schemas/collection_view.py). 

## Create and Delete

A "Default" collection is automatically created for each user. If you 
want your client to support collection creation and deletion:

??? abstract "POST /collections"
    [Scalar](https://api.mycelcloud.com/scalar#tag/collections/POST/collections) - 
    [Swagger](../../reference/api.md)

??? abstract "DELETE /collections/{col_id}"
    [Scalar](https://api.mycelcloud.com/scalar#tag/collections/DELETE/collections/{col_id}) - 
    [Swagger](../../reference/api.md)

## Fetch
**Required**{: .badge .badge-required}

To get all collections owned by the user, list them with:

??? abstract "GET /collections"
    [Scalar](https://api.mycelcloud.com/scalar#tag/collections/GET/collections) - 
    [Swagger](../../reference/api.md)

It returns a list of CollectionView.

!!! example "UI suggestion"
    You may want to add a section where you format and display these 
    to the user, so they can act on them (select, rename, delete, ...).

Once the user selects a collection, cache its ID — you'll need it for 
most subsequent queries.

## Update

To update a collection (name, settings, ...), use:

??? abstract "PATCH /collections/{col_id}"
    [Scalar](https://api.mycelcloud.com/scalar#tag/collections/PATCH/collections/{col_id}) - 
    [Swagger](../../reference/api.md)

See [Update Resources Page](./update.md) for more details.

---

Once the user has selected a collection, it's time to fetch the nodes associated with it.
