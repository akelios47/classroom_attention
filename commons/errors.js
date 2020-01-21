
exports.internal_server_error                           = { status: 500, value:  0, message: 'Internal server error' };
exports.generic_upload_error                            = { status: 500, value:  1, message: 'Upload error' };
exports.generic_download_error                          = { status: 500, value:  2, message: 'Download error' };
exports.authentication_fail                             = { status: 401, value:  4, message: 'Incorrect username or password' };
exports.authentication_error                            = { status: 401, value:  5, message: 'Authentication error' };
exports.generic_not_found                               = { status: 404, value:  6, message: 'Not found' };
exports.admin_restricted_access                         = { status: 403, value:  7, message: 'Only administrators can make this request' };
exports.demo_content_request_not_implemented            = { status: 403, value:  8, message: 'Demo content on the request not yet implemented' };
exports.demo_content_request_not_implemented 

exports.tag_not_found                                   = { status: 404, value: 23, message: 'Tag not found' };
exports.tag_post_request_error                          = { status: 400, value: 24, message: 'Tag not created' };
exports.tag_cannot_be_deleted_from_not_owner            = { status: 403, value: 25, message: 'Only the owner can delete a tag' };
exports.tag_cannot_be_deleted_with_tag                  = { status: 409, value: 30, message: 'The tag is already used in a tag' };

exports.user_not_found                                  = { status: 404, value: 40, message: 'User not found' };
exports.user_authorization_error                        = { status: 401, value: 41, message: 'Only the administrator can manage users' };
exports.user_post_request_error                         = { status: 400, value: 42, message: 'User not created' };
exports.user_cannot_be_deleted_with_tag                 = { status: 409, value: 47, message: 'The user is already owner of a tag' };

exports.reading_not_found                           = { status: 404, value: 35, message: 'Reading not found' };
exports.reading_authorization_error                 = { status: 401, value: 36, message: 'Only the owner can access a reading' };
exports.reading_post_request_error                  = { status: 400, value: 37, message: 'Reading not created' };
exports.reading_cannot_be_deleted_from_not_owner    = { status: 403, value: 38, message: 'Only the owner can delete a reading' };
exports.reading_delete_needs_filter                 = { status: 403, value: 39, message: 'To delete multiple reading you have to provide a filter' };

exports.manage = function(res, error, more) {
    if( typeof more === 'object' && more !== null) more = more.toString();
    if(!error) error = this.internal_server_error;
    error.details = more;
    return res.status(error.status).json(error); 
}
