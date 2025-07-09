// app/terms/page.tsx
export default function TermsPage() {
    return (
        <main className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">1. Aceitação dos Termos</h2>
                <p className="mb-4">
                    Ao utilizar o <strong>Roblox Asset Parser</strong>, você concorda com estes termos e com as <a href="https://en.help.roblox.com/hc/en-us/articles/115004647846" target="_blank" className="text-blue-500 hover:underline">Regras da Comunidade Roblox</a>.
                </p>
                <p>
                    Este serviço não é afiliado à Roblox Corporation.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">2. Uso Adequado</h2>
                <p className="mb-2">
                    Você concorda em não:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Violar direitos de propriedade intelectual</li>
                    <li>Utilizar o serviço para atividades ilegais</li>
                    <li>Contornar sistemas de segurança da Roblox</li>
                    <li>Automatizar ações contra os Termos da Roblox</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">3. Limitações</h2>
                <p className="mb-4">
                    Este serviço é fornecido "como está". Não garantimos:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Disponibilidade contínua</li>
                    <li>Compatibilidade com todas as contas Roblox</li>
                    <li>Precisão absoluta nos resultados</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">4. Propriedade Intelectual</h2>
                <p>
                    Todos os assets analisados permanecem propriedade de seus criadores originais e da Roblox Corporation.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">5. Suspensão de Serviço</h2>
                <p>
                    Reservamos o direito de suspender contas que violarem estes termos ou as diretrizes da Roblox.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-3">6. Contato</h2>
                <p>
                    Dúvidas? Contate: <strong>zgustovo13365@gmail.com</strong>
                </p>
                <p className="mt-2 text-sm">
                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </p>
            </section>
        </main>
    )
}