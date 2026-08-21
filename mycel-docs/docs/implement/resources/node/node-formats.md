# Node Formats

Mycel is not tied to any particular file format. While Markdown is configured as the default, you can customize existing formats or create new ones.

## Understand formats in Mycel

When storing a node, Mycel treats its content as opaque — it doesn't interpret or validate the format, and simply saves the raw content alongside a string identifying the format (see the `content_format` field in [NodeData](https://github.com/mycel-project/mycel/blob/main/src/models/node_data.py)). This field should still be set accurately when creating a node, since it's used both by Mycel-side formats and client-side logic to know how to handle the content correctly. See [Importing Resources](../../features/importing-resources.md) for details on how it's populated during import.

For now, `content_format` can contain any value, but in the future, users will be able to specify specific literals to prevent mismatches.é

Because Mycel treats content as opaque, clients can send and retrieve data in any format they prefer. Yet, this flexibility raises a question as soon as the text needs to be actively manipulated: who performs the formatting — Mycel, or the client?

??? example "Fragment extraction example"
	Say you have a fragment and want to extract one paragraph of it into another fragment. It would be nice if, in addition to creating the child fragment, the extracted region were also highlighted in the parent, as a reminder that this paragraph has already been processed. This means either Mycel or the client must apply this highlighting in a way that's consistent with the node's format (for instance, adding a blockquote `> ` for Markdown).

### Mycel-side

You can register a format directly by adding a dedicated file to Mycel: [src/formats](https://github.com/mycel-project/mycel/tree/main/src/formats). Each format inherits from the [BaseFormat](https://github.com/mycel-project/mycel/tree/main/src/formats/base_format.py) class and defines its own logic for things like highlighting extracted fragments, generating an outline, and so on.

To implement a custom format, you can use the Markdown one as a reference.

Because this formatting lives on Mycel's side, once implemented it works with any client.

The main drawback is that it's tied to Mycel's formatting logic, so advanced custom formatting isn't possible this way.

This same file is also where you configure the import pipeline for that format.

### Client-side

For total control over a node's formatting and rendering, this work can instead be done client-side.

You can use any format name for your nodes, even if it already exists in Mycel's built-in format files ([src/formats](https://github.com/mycel-project/mycel/tree/main/src/formats)). To safely share a format name (like `markdown`) without Mycel automatically injecting its own syntax, simply set the `auto_format` field to `false` on the relevant API endpoints. This disables Mycel's built-in formatting engine and gives you total manual control over the syntax. See the [Extracting section](#extracting) for an example.

#### Importing

For example, if you want a custom webpage fetch because your client already has web-import functionality for your target format, the standard approach is to fetch the page client-side, then call the `Create Node` endpoint with the `text` discriminator, providing your own content and specifying the format of your choice — this bypasses Mycel's import/conversion pipeline entirely.

You can also bypass Mycel's import pipeline while still using its conversion: fetch the page client-side, adjust it as you see fit, then convert it through Mycel by specifying `initial_format` and `target_format` on `NodeCreateFromText`. For instance, you could fetch HTML directly on the client, clean it up, pass it as text, and have Mycel convert it to your client's preferred format by setting `initial_format` to `html` and `target_format` accordingly.

#### Extracting

For total control over formatting when extracting — for example, to manually mark which parts of the parent node have been processed using your own custom syntax — you can set the `auto_format` field to false in your request.

This will extract the child node normally but skip applying Mycel's automatic format emphasis on the parent node. You can then apply your own formatting by calling the `Update Node` endpoint on the parent.

#### Coming soon? — metadata/frontmatter

#### Other features

With this approach, you won't have access to some of Mycel's features, such as outline generation or splitting. You can implement these yourself client-side, or simply add a file under `src/formats` that implements only those specific methods.

## Mycel-specific formats

Mycel does not impose many format-specific requirements — the main one being the cloze format `{{c1::text}}`.
