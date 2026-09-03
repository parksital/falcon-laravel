<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/LoginPage', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
            'copy' => [
                'title' => __('login.title'),
                'heading' => __('login.heading'),
                'description' => __('login.description'),
                'email_label' => __('login.email_label'),
                'email_placeholder' => __('login.email_placeholder'),
                'password_label' => __('login.password_label'),
                'password_placeholder' => __('login.password_placeholder'),
                'forgot_password' => __('login.forgot_password'),
                'submit' => __('login.submit'),
                'register_prompt' => __('login.register_prompt', ['appName' => config('app.name')]),
                'register_link' => __('login.register_link'),
            ],
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/ResetPasswordPage', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'copy' => [
                'title' => __('reset-password.title'),
                'heading' => __('reset-password.heading'),
                'description' => __('reset-password.description'),
                'email_label' => __('reset-password.email_label'),
                'password_label' => __('reset-password.password_label'),
                'password_placeholder' => __('reset-password.password_placeholder'),
                'password_confirmation_label' => __('reset-password.password_confirmation_label'),
                'password_confirmation_placeholder' => __('reset-password.password_confirmation_placeholder'),
                'submit' => __('reset-password.submit'),
            ],
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/ForgotPasswordPage', [
            'status' => $request->session()->get('status'),
            'copy' => [
                'title' => __('forgot-password.title'),
                'heading' => __('forgot-password.heading'),
                'description' => __('forgot-password.description'),
                'email_label' => __('forgot-password.email_label'),
                'email_placeholder' => __('forgot-password.email_placeholder'),
                'submit' => __('forgot-password.submit'),
                'login_prompt' => __('forgot-password.login_prompt'),
                'login_link' => __('forgot-password.login_link'),
            ],
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/VerifyEmailPage', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/RegisterPage', [
            'copy' => [
                'title' => __('register.title'),
                'heading' => __('register.heading'),
                'description' => __('register.description'),
                'name_label' => __('register.name_label'),
                'name_placeholder' => __('register.name_placeholder'),
                'email_label' => __('register.email_label'),
                'email_placeholder' => __('register.email_placeholder'),
                'password_label' => __('register.password_label'),
                'password_placeholder' => __('register.password_placeholder'),
                'password_confirmation_label' => __('register.password_confirmation_label'),
                'password_confirmation_placeholder' => __('register.password_confirmation_placeholder'),
                'submit' => __('register.submit'),
                'login_prompt' => __('register.login_prompt'),
                'login_link' => __('register.login_link'),
            ],
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/TwoFactorChallengePage'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/ConfirmPasswordPage'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
