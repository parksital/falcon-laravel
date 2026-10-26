<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetBearerTokenFromPath
{
    /**
     * Use the `{token}` path segment as the bearer token, for MCP clients that can't send an Authorization header.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Authorization', 'Bearer '.$request->route('token'));

        return $next($request);
    }
}
