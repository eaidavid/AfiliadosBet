-- Insert test payment data for demonstration
INSERT INTO payments (user_id, amount, method, pix_key, status, transaction_id, paid_at, created_at) VALUES 
-- Pending payments
(1, 150.00, 'pix', 'usuario1@email.com', 'pending', NULL, NULL, NOW() - INTERVAL '1 day'),
(2, 320.00, 'pix', '12345678901', 'pending', NULL, NULL, NOW() - INTERVAL '6 hours'),
(3, 500.00, 'bank_transfer', NULL, 'pending', NULL, NULL, NOW() - INTERVAL '30 minutes'),
(1, 180.25, 'bank_transfer', NULL, 'pending', NULL, NULL, NOW() - INTERVAL '3 hours'),

-- Completed payments
(2, 250.75, 'pix', '+5511999999999', 'completed', 'TXN_20250611_001', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '2 days'),
(4, 89.99, 'pix', 'chave.pix.aleatoria.123', 'completed', 'TXN_20250611_002', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '3 days'),
(5, 1250.00, 'pix', 'empresa@dominio.com.br', 'completed', 'TXN_20250611_003', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '4 days'),
(5, 350.00, 'pix', 'contato@empresa.com', 'completed', 'TXN_20250611_004', NOW(), NOW() - INTERVAL '5 days'),

-- Failed payments
(3, 75.50, 'bank_transfer', NULL, 'failed', NULL, NULL, NOW() - INTERVAL '36 hours'),
(3, 45.00, 'pix', '98765432109', 'failed', NULL, NULL, NOW() - INTERVAL '18 hours');