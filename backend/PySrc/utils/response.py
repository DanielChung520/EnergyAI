from flask import jsonify

def success_response(data=None, message=None):
    """
    返回成功響應
    :param data: 響應數據
    :param message: 成功消息
    :return: JSON 響應
    """
    response = {
        'success': True
    }
    
    if data is not None:
        response['data'] = data
    
    if message is not None:
        response['message'] = message
        
    return jsonify(response)

def error_response(message, code=400):
    """
    返回錯誤響應
    :param message: 錯誤消息
    :param code: HTTP 狀態碼
    :return: JSON 響應
    """
    return jsonify({
        'success': False,
        'error': {
            'message': str(message)
        }
    }), code 