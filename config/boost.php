<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Boost Project Rules
    |--------------------------------------------------------------------------
    |
    | Project rules live in .claude/rules, so Boost's .ai/rules feature and
    | its record-rule tool stay off.
    |
    */

    'rules' => [
        'enabled' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Excluded Guidelines
    |--------------------------------------------------------------------------
    |
    | "tests" conflicts with the project's no-tests-unless-asked rule, and
    | "deployments" only points at Laravel Cloud. The rest live as
    | path-scoped rules in .claude/rules so they only load when relevant.
    |
    */

    'guidelines' => [
        'exclude' => [
            'tests',
            'deployments',
            'php',
            'laravel/core',
            'laravel/v12',
            'pint/core',
            'pest/core',
            'inertia-laravel/core',
            'laravel-fortify/core',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Agent Paths
    |--------------------------------------------------------------------------
    |
    | Write the Boost guidelines to a dedicated Claude Code rule file instead
    | of appending them to CLAUDE.md.
    |
    */

    'agents' => [
        'claude_code' => [
            'guidelines_path' => '.claude/rules/laravel-boost.md',
        ],
    ],

];
