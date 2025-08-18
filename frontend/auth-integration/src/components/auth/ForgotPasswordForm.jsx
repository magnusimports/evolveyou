import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState('');

  const { resetPassword, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setLocalError('Por favor, digite seu email');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Por favor, digite um email válido');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError('');
      clearError();
      
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      setLocalError(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Email Enviado!
          </CardTitle>
          <CardDescription>
            Enviamos instruções de recuperação para seu email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e spam para encontrar o email de recuperação.
            </p>
            <p className="text-sm text-muted-foreground">
              O link de recuperação expira em 1 hora.
            </p>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Email enviado para: <strong>{email}</strong>
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
          >
            Enviar para outro email
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Recuperar Senha
        </CardTitle>
        <CardDescription className="text-center">
          Digite seu email para receber instruções de recuperação
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Você receberá um email com instruções para redefinir sua senha.
              Verifique também sua pasta de spam.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email de Recuperação
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ForgotPasswordForm;

