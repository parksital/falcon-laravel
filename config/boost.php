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
    | "deployments" only points at Laravel Cloud.
    |
    */

    'guidelines' => [
        'exclude' => ['tests', 'deployments'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Agent Paths
    |--------------------------------------------------------------------------
    |
    | Write the Boost guidelines to a dedicated Claude Code rule file instead
    | of appending them to AGENTS.md.
    |
    */

    'agents' => [
        'claude_code' => [
            'guidelines_path' => '.claude/rules/laravel-boost.md',
        ],
    ],

];
