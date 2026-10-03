# Banco — proposta inicial

Tabelas previstas: users, trips, places, trip_places, flights, stays, activities, transfers, routes, reminders, weather_snapshots, offline_packages e offline_package_routes.

Referência textual para vocês criarem as tabelas manualmente. Nenhuma tabela é criada automaticamente.

PK = chave primária; FK = chave estrangeira; ? = opcional. Campos são uma proposta inicial, sujeita a revisão.

- Users guarda apenas hash de senha; email deve ser único sem diferenciar maiúsculas.
- Trips pertence a um usuário. Voos, hospedagens, atividades, deslocamentos, rotas, lembretes, previsões e pacotes offline pertencem a uma viagem.
- Places pode existir sem viagem. Trip_places associa lugares e viagens do mesmo usuário.
- Atividades podem não ter horário. Roteiro é composto dos registros originais, sem duplicação de eventos.
- Instantes usam timestamptz e fusos IANA separados. Chegada, check-out e fim de viagem respeitam a ordem temporal.
- Deslocamentos e lembretes podem apontar para um único evento da mesma viagem. Saída é calculada dos dados atuais.
- Routes guarda geometria permitida pelo fornecedor. Offline_packages descreve cobertura e estilo. Estado de download fica no navegador/aparelho, sem status global de download no banco.
- Updated_at precisa ser atualizado pela aplicação ou trigger definida manualmente.

Franquias de bagagem por voo foram reintroduzidas no escopo, conforme abaixo. Checklist de mala continua fora. Índices, constraints, autorização e regras de exclusão serão definidos ao desenvolver cada módulo.

## Atualização: catálogo, experiências e franquias por voo

Estas tabelas são propostas para criação manual futura, sem SQL/migrations gerados agora:

| Tabela | Dados/responsabilidade |
|---|---|
| airports | Catálogo importado OurAirports: códigos, nome, cidade/país e coordenadas. Não contém preço de passagem. |
| experiences | Passeios de operadores: destino, nome, operador, ponto de encontro, duração, descrição, links externos e origem/verificação. Ponto de encontro pode referenciar places. |
| experience_stops | Relaciona experiências e lugares de parada em ordem; referencia experiences e places. |
| catalog_media | Imagens autorizadas: place_id ou experience_id (exatamente um), URL/arquivo permitido, autor, licença, fonte e atribuição. |
| flight_baggage_allowances | Por voo/trecho e, quando necessário, passageiro: item pessoal, cabine ou despachada; inclusão, quantidade, peso/dimensões, fonte e confirmação. |

Extensões propostas nas tabelas existentes:

- places: informações externas disponíveis, identificadores do fornecedor/Wikidata, site oficial, URL de ingresso/reserva e data/fonte da verificação. Ingresso admite gratuito, pago, depende ou desconhecido.
- activities: referência opcional a experiences; dados confirmados de passeio e ponto de encontro.
- flights, stays e activities: valor pago/moeda opcionais preenchidos manualmente, separados de qualquer preço de oferta externa.
- Experiências/lugares podem ter preços informativos apenas com unidade, moeda, contexto, fonte e data. Informação ausente não é zero. Dados vivos de fornecedores respeitam permissão de armazenamento.
- Conteúdo curado/externo de catálogo deve ser separado de notas e reservas privadas. Chave única do fornecedor e relações coerentes reduzem duplicações; exclusão de favorito privado não remove catálogo de todos.

Abrir link de reserva/ingresso não cria uma compra no banco. O usuário registra o que contratou manualmente. Galerias/preços completos dependem de conteúdo autorizado e cobertura; não se presume que uma API gratuita tenha todos os campos.

Veja os briefings atualizados na seção 6 de [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md).
