import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../home/widgets/furniture_card.dart';
import '../models/chat_message.dart';
import '../providers/ai_chat_provider.dart';

class AiChatScreen extends ConsumerStatefulWidget {
  const AiChatScreen({super.key});

  @override
  ConsumerState<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends ConsumerState<AiChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  void _send() {
    final text = _controller.text;
    if (text.trim().isEmpty) return;
    _controller.clear();
    ref.read(aiChatProvider.notifier).send(text);
    Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aiChatProvider);

    ref.listen(aiChatProvider, (prev, next) {
      if (prev != null && next.messages.length > prev.messages.length) {
        Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Shopping Assistant'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded),
            tooltip: 'Clear conversation',
            onPressed: state.messages.isEmpty ? null : () => ref.read(aiChatProvider.notifier).clearHistory(),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: state.messages.isEmpty && !state.isLoadingHistory
                  ? _buildEmptyState(context)
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16),
                      itemCount: state.messages.length + (state.isSending ? 1 : 0),
                      itemBuilder: (context, i) {
                        if (i >= state.messages.length) return _TypingBubble();
                        return _MessageBubble(message: state.messages[i]);
                      },
                    ),
            ),
            if (state.suggestedItems.isNotEmpty) _buildSuggestions(state),
            if (state.errorMessage != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Text(state.errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 13)),
              ),
            _buildInputBar(state),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.chat_bubble_outline_rounded, size: 56),
          const SizedBox(height: 16),
          Text(
            'Ask me anything about furniture',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            '"What sofa fits a small apartment?"\n"Suggest a TV for my bedroom"\n"Compare oak vs walnut dining tables"',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestions(AiChatState state) {
    return SizedBox(
      height: 210,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: state.suggestedItems.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) => SizedBox(width: 150, child: FurnitureCard(item: state.suggestedItems[i])),
      ),
    );
  }

  Widget _buildInputBar(AiChatState state) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _send(),
              decoration: const InputDecoration(hintText: 'Ask about furniture or appliances...'),
            ),
          ),
          const SizedBox(width: 8),
          IconButton.filled(
            onPressed: state.isSending ? null : _send,
            icon: const Icon(Icons.send_rounded),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUser = message.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isUser ? theme.colorScheme.primary : theme.colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isUser ? 18 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 18),
          ),
        ),
        child: Text(
          message.content,
          style: TextStyle(color: isUser ? theme.colorScheme.onPrimary : theme.colorScheme.onSurface),
        ),
      ),
    );
  }
}

class _TypingBubble extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(18),
        ),
        child: const SizedBox(
          width: 24,
          height: 12,
          child: Center(child: SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))),
        ),
      ),
    );
  }
}
