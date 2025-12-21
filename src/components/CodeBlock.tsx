import { useEffect } from "react";
import { toast } from "sonner";

export const useCodeBlockCopy = () => {
  useEffect(() => {
    const handleCopyClick = async (e: Event) => {
      const button = e.currentTarget as HTMLButtonElement;
      const codeBlock = button.closest('.code-block-wrapper')?.querySelector('code');
      
      if (codeBlock) {
        try {
          await navigator.clipboard.writeText(codeBlock.textContent || '');
          button.classList.add('copied');
          toast.success("Copied to clipboard!");
          
          setTimeout(() => {
            button.classList.remove('copied');
          }, 2000);
        } catch (err) {
          toast.error("Failed to copy");
        }
      }
    };

    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('pre:not(.has-copy-button)');
      
      codeBlocks.forEach((pre) => {
        pre.classList.add('has-copy-button');
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper relative group';
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button absolute top-2 right-2 p-2 rounded-md bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted';
        copyButton.innerHTML = `
          <svg class="copy-icon w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <svg class="check-icon w-4 h-4 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        copyButton.title = 'Copy to clipboard';
        copyButton.addEventListener('click', handleCopyClick);
        
        wrapper.appendChild(copyButton);
      });
    };

    // Run initially and observe for changes
    addCopyButtons();
    
    const observer = new MutationObserver(() => {
      addCopyButtons();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
      // Cleanup event listeners
      document.querySelectorAll('.copy-code-button').forEach(button => {
        button.remove();
      });
    };
  }, []);
};
