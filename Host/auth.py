# -*- coding: utf-8 -*-
from fastapi import Request, HTTPException
from functools import wraps

def require_auth(f):
    @wraps(f)
    async def decorated(request: Request, *args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token != 'Bearer your-secret-token':
            print(token)
            raise HTTPException(status_code=401, detail="Non autorisé")
        return await f(request, *args, **kwargs)
    return decorated
