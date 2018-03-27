Access Token
------------
Box Annotations needs an access token to make Box API calls. You can either get an access token from the token endpoint (https://developer.box.com/reference#token) or generate a developer token on your application management page (https://blog.box.com/blog/introducing-developer-tokens/).

If your application requires the end user to only be able to access a subset of the Annotations functionality, you can use [Token Exchange](https://developer.box.com/reference#token-exchange) to appropriately downscope your App/Managed or Service Account token to a resulting token that has the desired set of permissions, and can thus, be securely passed to the end user client initializing Annotations.

Below are a set of new Annotation-specific scopes to go alongside Token Exchange. These allow developers to enable/disable functionality on Box Annotations by configuring the appropriate scopes on the downscoped token. To learn more, see [Special Scopes for Box UI Elements](https://developer.box.com/v2.0/docs/special-scopes-for-box-ui-elements).

### Base Scope
| Scope Name | What permissions does it grant? |
| --- | --- |
| base_preview | Allows preview access to a file or files in a folder based on user/file/token permissions |

### Feature Scopes
| Scope Name | What permissions does it grant? |
| --- | --- |
| item_download | Allows files/folders contents to be downloaded |
| annotation_view_self | Allows user to view their own annotations |
| annotation_view_all | Allows user to view all annotations on the file |
| annotation_edit | Allows user to edit their own annotations (includes annotation_view_self) |

### Sample Scenarios
| Scenario| Scope Combinations |
| --- | --- |
| User wants basic preview functionality + ability to edit own annotations| base_preview + annotation_edit |
| User wants basic preview functionality + ability to edit own annotations + ability to highlight text| base_preview + annotation_edit + item_download |
| User wants basic preview functionality + ability to view all annotations + ability to edit own annotations| base_preview + annotation_view_all + annotation_edit |
| User wants basic preview functionality + ability to view only their own annotations| base_preview + annotation_view_self |

**Note:** If the access token is not scoped to include `item_download`, the users will not be able to create highlight annotations even if `highlight` or `highlight-comment` is specified as an enabled annotation type.