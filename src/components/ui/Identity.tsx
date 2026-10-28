"use client";

import styled from "styled-components";

/** Two-line cell: a primary label (`strong`) over secondary text (`span`). */
export const Identity = styled.div`
  min-width: 0;
  line-height: 1.35;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: ${({ theme }) => theme.font.sizeSm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
