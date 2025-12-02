import { Request, Response } from 'express';
import { SessionManager } from '../services/session-manager.js';
import type { ReceiptRequest, NfcSessionResponse } from '../types/index.js';

/**
 * NFC 영수증 API 컨트롤러
 */
export class ReceiptController {
  constructor(private sessionManager: SessionManager) {}

  /**
   * POST /api/receipts
   * NFC 영수증 세션 생성
   */
  createReceiptSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: ReceiptRequest = req.body;

      // 요청 검증
      if (!request.orderId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'orderId is required',
        });
        return;
      }

      if (!request.items || request.items.length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'items are required',
        });
        return;
      }

      console.log('[ReceiptController] Creating NFC session:', {
        orderId: request.orderId,
        includeReceipt: request.includeReceipt,
        orderType: request.orderType,
      });

      // 세션 생성
      const session = await this.sessionManager.createSession(request);

      // 응답
      const response: NfcSessionResponse = {
        sessionId: session.sessionId,
        status: session.status,
        expiresAt: session.expiresAt.toISOString(),
        message: 'NFC session created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('[ReceiptController] Error creating session:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create NFC session',
      });
    }
  };

  /**
   * GET /api/receipts/:sessionId
   * NFC 세션 상태 조회
   */
  getSessionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      const session = this.sessionManager.getSession(sessionId);

      if (!session) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Session not found',
        });
        return;
      }

      const response: NfcSessionResponse = {
        sessionId: session.sessionId,
        status: session.status,
        expiresAt: session.expiresAt.toISOString(),
      };

      if (session.error) {
        response.message = session.error;
      }

      res.status(200).json(response);
    } catch (error) {
      console.error('[ReceiptController] Error getting session status:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get session status',
      });
    }
  };

  /**
   * GET /api/receipts
   * 모든 세션 조회 (디버깅용)
   */
  getAllSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessions = this.sessionManager.getAllSessions();

      res.status(200).json({
        total: sessions.length,
        sessions: sessions.map((session) => ({
          sessionId: session.sessionId,
          orderId: session.orderId,
          status: session.status,
          createdAt: session.createdAt.toISOString(),
          expiresAt: session.expiresAt.toISOString(),
          completedAt: session.completedAt?.toISOString(),
          error: session.error,
        })),
      });
    } catch (error) {
      console.error('[ReceiptController] Error getting all sessions:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get sessions',
      });
    }
  };

  /**
   * GET /api/health
   * 헬스 체크
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = this.sessionManager.getStats();

      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        sessions: stats,
      });
    } catch (error) {
      console.error('[ReceiptController] Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Failed to get health status',
      });
    }
  };
}
