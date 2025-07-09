// app/privacy/page.tsx
export default function PrivacyPage() {
    return (
        <main className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">1. Informações Coletadas</h2>
                <p className="mb-4">
                    Nosso aplicativo <strong>Roblox Asset Parser</strong> coleta apenas as informações necessárias para autenticação via Roblox OAuth:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>ID da conta Roblox</li>
                    <li>Nome de usuário básico</li>
                    <li>Avatar (se aplicável)</li>
                    <li>Token de acesso temporário (válido por 24 horas)</li>
                </ul>
                <p>
                    <strong>Não armazenamos</strong>: senhas, e-mails, dados de pagamento ou qualquer informação sensível.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">2. Uso dos Dados</h2>
                <p>
                    Os dados são utilizados exclusivamente para:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Autenticação segura</li>
                    <li>Exibição personalizada de assets</li>
                    <li>Melhoria da experiência do usuário</li>
                </ul>
                <p>
                    Em conformidade com as <a href="https://en.help.roblox.com/hc/en-us/articles/115004630823" target="_blank" className="text-blue-500 hover:underline">Diretrizes da Roblox</a> e o GDPR.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">3. Compartilhamento de Dados</h2>
                <p>
                    Não compartilhamos dados com terceiros, exceto:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Quando exigido por lei</li>
                    <li>Para processamento técnico essencial (ex: hospedagem Vercel)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">4. Direitos do Usuário</h2>
                <p>
                    Você pode:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Solicitar acesso aos seus dados</li>
                    <li>Revogar permissões a qualquer momento</li>
                    <li>Excluir sua conta do nosso sistema</li>
                </ul>
                <p>
                    Para exercer esses direitos, contate: <strong>seu-email@provedor.com</strong>
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-3">5. Alterações</h2>
                <p>
                    Esta política pode ser atualizada. A versão atual foi publicada em {new Date().toLocaleDateString('pt-BR')}.
                </p>
            </section>
        </main>
    )
}