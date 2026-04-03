/**
 * Neko.js - Bundled version
 * Copyright (C) 2025 Louis Abraham
 *
 * Based on Neko98 by David Harvey (1998)
 * Original Neko by Masayuki Koba
 *
 * Licensed under GPL v3 (see LICENSE.md)
 */

(function () {
   "use strict";

   // Embedded sprite data (base64-encoded)
   const NEKO_SPRITES = [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB7ElEQVR4AcyUgZKDIAxE5f7/n7286CIHiWA7nWvHNXGzWQK2/dn++fO1A+wfOJjQMzuBYgOEDTe8lfyK+uDwdEF7ywZAQwON5IKeFcUrileEJ8eLfMDdAIhpxIC8R8/3z9LjoXyIGoBmMAiMkEFWN0l43empgU0DsAiABKFjQEqrGEj+UOgAa4E6gFSQABEQ3+biFFdqaADeQL3DACogAnp+N+IFBh+9gqHQE/u+bwI15W3seZ5nYACOpsWs5516uw65vwKOpsU7C8x623XIfYBZ01Dn2AfSiIy3UnrxCtJiXyilbKUcUK2UorTWSrm4WkyS1QGKfeqXsN1pn/MM0Nua00lWBzAvNjj1Q4eQuCR+MoCbsjMBQhBHNK5f3L/xxg/X0wEwwByQ94AHLW9vxNf3W1sgf2UA+mRK7jCC2C9idE8hu/DKAKmpFXDWivZ4pMlrQfv4f6CaendwMwGshfniCFdOACeA/hHOnd/2zAbwndgNk3CIbBF4+oA1h73G374C67367AG9fuOeRzcWhpe+yS8zyBOzEzhlR2hNDya+r+rovh2A3QCEr4J+kPVnA/hxsROQNctYMdLRD86a+565h2wAL2Lcg4I4coP/87Wc8jaaLryyATBdBcarWnToK7IBquDTyccHmG3gFwAA//9L69BZAAAABklEQVQDAJ8AwkGrVl5WAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABWElEQVR4AeyV2xKDMAhE3f7/P1tOlE7qBTD60pk62ZIQWDbEjq9p/JkttYctr4+qgL6Qz7fV3N/bbcxuXRUgywRmSoNYkAZXBfipUsI1oBxfFbDyPm9+QgDtHD16mvsTHRg9fSmv0oHS3+mkWppbEbDjnud52mIXVHRcEuBFj7h9D3u0f+bLBPAWg5YvaZIWNEf3Iy1+SZ13Ihf0vq95JKAlciJAFtbBuof7sfixgLmhcZndjUhAu2cyJH3mrDNQWFo6wTyKDwVEiU/tpQKka6d3YZxcWrrgviObCoDoKLHiq+RGAmRPpU4Ys3KctiISEBI/tfkXkHXArvD0+tJbsGRiQoJMQCOACLCogFhgsWFx258qAoiDyDj1+RbYAn8D8x7m1Aoz8agKcBYnxrrPLT6H+1J7VUBKeDXgL+BOB+y9U3spre0yDI07AihIYcB8CHcFpEWzgDcAAAD//1+sZh0AAAAGSURBVAMAYVluQaww2RgAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABWklEQVR4AeyW246DMAxE8f7/P7M+gSAn4Eta7cNKVAw4k/F4FJWqP9vnn11bLXS5fmUB7IC5nqfN+3Y9a691FACDS/hl4XpFAb6cWWt/A7wn8J5AdALCi7Tv91cYbgbaGWhOrnmd9fCIAlzCbsQTXBumgO+ApuaZoRQAEwxFZBM5AGchcvAisqG1e1FdDoAJxh2sLTrP0/JZnQUQ/WQe7v7ZK65AN7IAKjkuzMCx8u9ogK8Yd0oBMORogW2HB5ZDA2beamxdCoChbaJmADyghrOAt2uvzgKoz/13wDObeW2GCg2yABj8Kd4A//cEzi9Y+37YuhELt49PgFfPYmHmIM0C6Izwl5RNMJj2hTZTuvtsZgHQ3PBgrFQ45+bRieUAOonep2m69UQj97EUQCfgFE1RSbRN+4hKgGaqNzor7iqV9sdFG0QRXpUAGGAEqCtAC1JtNUBq5Aky/hcAAP//U7TrGQAAAAZJREFUAwBa+nxBKNA1UgAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABf0lEQVR4AdyUi5KDIAxFPfv//9zNjY0F5aHI2pl1DARIco+p9WcZu16WFmbu+D0KkCoGSGtO4zN/BkBWsLIQXPHoKQCJFyGeBEghBCNbngYICMyRfQXAhQ3A7290wIVjuAKg3yws8m/PPYAQ1HxbzApk7bd18x142bXMMomVrNYB053z0MACSNsHOamVAKaKm5iEZeYe7xLAMeoPd/YA057+LHMK8Li4IFMArS8bEC9Zlgtk69riNoC1zf+qUBQsbqYwtwHSYtDVS8PdzwDgegGv8h7Ujbd7esoATmd1AsEfxIdOaP4pHnkCCcApLYUeLDqQfXfhUxAovuVRCXBX8EDE4psnhgDwN1nxsOYCXkyFtV8ywLd3Meumn/QHAVj+2gDYct2xg2oF8JDtHPL1dtBxBLAP2SoB3gUFwMfXWnBhgLaGTADYFUJpJfl787gk3kUDxBcXBwEoJYTktyziNGcwgmol1s4CoHbe2hdEyVo5h7M7AIdiIxv/H6DXlV8AAAD//zWMFNEAAAAGSURBVAMAAU6RQR1bZpwAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABqUlEQVR4AdyW4XLDIAyD473/O3f6TO0jCU0w2W53yyFwjC0Jmh/92v74+RcGXrrEK2j783h6Awh/Zm87lzUVAxAd0STuZ/qGVRUDQ4JCcmiiYsAKYqNS+jEBcr9iIJseBJgASVE1sGtOlvmA0/fYqgbmpc6VCJ+yVQMvPU7COgMv1tTX6jVHxYA4hodIsj4ws83MPKVGX5nMWk6xByMDqARU50McpDze9JLkLXOeqQnErplr8prByIAL0KxKVBWy6K0bSqYJs8Zn1tauLEOz3MuAzaEBNgIIRXxcY++4HuvMXJMJ7LZHBkyPF0EcsSeKE71AbSdh5XyMDJzv20trUyf8URzGkQH/Bt4Eu5iGGbx7L4WDpzfAyXXrLLHdViVbMDFXxKELA9J4+WlJAiVYSqiKQx4GiC/xJr+sWdmcMoD4yo3MGLo18JviGMSADrf/8BANUDQD6lU39eWrLgcG8oWgI4IMkP417Ax04iXB1T5EdgZI3AGxI9SzfFNpANI7oq4GwR5qXRtuoCNeY3nQhYE4yQOa9VYMrHf/QOeMAf1CFv9+rKp5V/8NAAD//+bc32MAAAAGSURBVAMA76GdP5JN1D0AAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB0UlEQVR4AeyWWW7DMBBDzd7/zi7fWCPImyw1CfqTQNTsHMYGgvws//z5CvjLE1j91hJ2XzszAq6WXuWmFI0IGFky0nMp7EkAxJeDN8nZ/uVJwM2ebnpKRE/AFNFBUm+WGoiROwG1Ibred514rwSs/iyvwprbZfimXIPXtXqOAqKJqiRMF9Jjz2mxFDNxQd4KqMspAKn2EZ7ggUU690iKb0odnAabRApwH2K3ihSkcW2ZudtkwwMpoA5IsTeumuw4LJOG2+PJmK5+WwSYY4ulIIqLJhds3nekjbrwxlIExAYpinE54Z6o2/3sCQFS7I2rrJM/xe0b+qx210QusStcBAhgMTiWzXGVPrbtYw/Fe05RxICuzOEXrAgo/pyBFECKzWni1icGmUubuUcBLTl+AiJIiLHEM2DO/XoU4KbdYVkCEvxdQwmogRLuTMnH++0JMPf2210G4t3iJ9ywIybIGr7hUPFraada8kacnoBoYDCc5mIxaFKVvMmr1LFHlNLS/0NSlsvddjH2fBzUhemzGBDTYgyd3hNgI6hEhZyYfCJeTSRFaomLeAQ9Acf5W2JJiyT648IZxYwAOFkA8BPEicwN21kBw8SjjV8BH38CT6/iFwAA////MLR0AAAABklEQVQDAMLU20GDsb3dAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABtElEQVR4AeyTjXKDMAyD0d7/nZk+U4Ob8FNauN3t2osSY8uyAtvP8Me/rwHewOivkHB422JGJ46BmlwlVcKb8aZuawD9TTLFN7CrhwGtiO42rfC3Uoc6GKD5DhOHwxmcBoivMsFggGaLLl8NQN4y0TVCXsErvCdOayA0x3EcWrhAY8KP3aLW9aUO7BIHl9yqAQotspnTNQSAw2U9akvihag1YI1Ot5MxKW7qQpKdytDZE6s1cKJ1aE3s9trhXH/E4fgjAygiBogrJA3Sglqr8ccGqliNMVVRazW+zUAd0saSSMVWDdhwfBaKl0JS+zmUA6qBzO2e0ty7y6MoKQY7VgM/TgsDXPvw9pJCzMSp86IdA/nv1ElK01BJwTk7vPC5ZKdPIgwQAGkZKD0PlaYavC1IPefIxGxAUuiWhnjlUuTZwJyT1MUI0C+JcAY54ET3JsKANDVAkiJmq3BvrJpr44ng/tSRoEQ6NvIOnkxgABaIG5kQsc+zi76AtHw+Sakbeq0JDETBmx7w8fGSfzk4dPOZ0+rkfAxDNRCJCzdZC/iIRZyIBNudBtA/xNfA/38DR38EvwAAAP//A+TAHAAAAAZJREFUAwDGUr5B8eHSWgAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABr0lEQVR4AeyVUZaDIAxFZfa/Z+fdtBFUAop45md6iIQkvFyLtj/LH3/+Ae58A6tOKzKlxkYJUBN3VXLu12byWC3XjDlAtNnjqamSk16fIx3PAVoNXJQarCXZy5/2OgAJNruxLg0ItzL+2C8BHotJAEhN18dsADrfgggB1nVdRk0UDsGMKVQfIUC9/FZU/GFvEtjyGoC6l7TWTAFmpZi00ogAkj5K3x/sU4dtY+HL/RzrlpQTASi1SIu3ErdvKmaDPTfHanU+hrZ1C4Ai6fYhVGSNW40Qc6Nevgn3AFTHjSUu+MMWwV0BoGnSReBM8iaOqwDesgoR3Z1vas13AapaorIjYi4LemvVriMA0t0fBd+Am5LSvTT4MUgjADv1Y0NAdgXxwu5iFEB9bb+9flpU2xxhjms2jQKwV333EAoQr5rnfPaiJwBoSC9DcIcKbA8kPkWY5/Bln01yngJIgn6bnh0JzUhgQLiVcXLYDAB01CNDEPgaQczAiH0heANYvvd3bOr5EgFOBQibZI6zN+sIXNkgdPF1OSuceGCIJS7YbAA0EXdjXdop/gZA2XDpLX4BAAD//7nZoQgAAAAGSURBVAMATKGpQcEEzRoAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABq0lEQVR4AdyUC3LDIAxETe9/Z1dPQUQGQVHtTqfNsEHf1UIcfxy//PkTAk65JIOYz67ZDdhAdj8R3+Dj37YjAQzYIaTOY6dnqIkElKFqL4CYvUpXFQkgjQiAnUFaxEwAQ9NkNAlSfTMBKRIZ2i/6DT43xGYCfNNTNsMHrqmA8zyPHnT3sd73NdgVUvbiq37bpgJahTOE5Shl/myWUlS0a8GUtvDw5I6UADqELRRRyjicWkDfDGkBEVEp4/CoLorNBBT5RPWPx2YCbg/qD2B+/UnaQ/FjAnZPkBbASeopdAY+BjvA3gS3cKYF9OSI8bA8MbPZe19i/J/LbQFCtLVmt7MSID2IfPNL4PKiwX9n11ZwA9qwEkCBzLiKIBhBCqOwxsgBnLo30q8E0NPAKSqBvg3xLYlNLkKtkZTO1a8a23oVW6P1LHeE9HANl+HEUzdAAxBFl2dhFaNW8sNgienaFSA8Lw5Op531SxL6c+Bis4Nq0wQIhdgVoM2VtNnOZ4iCGJAifNnWKyNACSs5rPgGfEMUs9ywZwTQbOTs+LeRFXB7YE/w/wX0J+79TwAAAP//pyd2xwAAAAZJREFUAwDZtahBSa7mYQAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABiklEQVR4AeyT0bLDIAhEs/f//zmXJSFFlIjN9KEzzYgiwnJq0r/t2bNLOU2W98YTAN/Y+0skTwCWGmXJP4CvuwF+bGbxtVqcazxL9ys3sCJczq0ClAXdTy3VVABKQq6xd6e1M4Bdnu2JCc0txAxA6tsBoA2EHdCeE15SUoglAAB6G0DbRBroAO7PNSlMdwACPwaXgw1oIYCjedDXLfPFGYrdAUjNawB5g1fW4bEh0AIeJ/1cBoilvglQh4s6JQAgbwCMf6kHjE39vgTgC7zPJmY+vuJnAMMPZkU4ye10MwC9V0CXRKseBi6dy7HqDEBudk//80Cno3pAHweO70cEmVO+ASZ3/3UNvjEBPZjJZDdwNT/JLX95tXpgDJEBMJumDSkCXFt9NXogE5DHWScpNphIs72uGYAeygR5rtugL7FmhCZ6ZnlcaRLsGktMxwyASSym0VcYitI0cE7cm50hLqyj0R9aBcAKKeRtBOPP6Vttuq4ARBE2iBZzpvsnAFPxSsIP4OM3MHsN/wAAAP//FvsB7QAAAAZJREFUAwACtZpBVYuMiAAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABj0lEQVR4AeyU4ZKDIAyE2Xv/d/byUUHRAKHn/ehMHVfiJtms1PqT4sdmpcCWenIPKrEHcGC/7S9RA2exEpcV9UhM3Q1RA7fGp4iPMHDe3vLgHkfO4z2O2ownd2A4KE9zLk8acOTn1NfAR+yA+CW3bUuroM+Q+211z+UdkIZ6SRrnry4iBuzBX/8wSXkXJH+I1OatkXmvZiIHEQO3NoSl1oT0Gn4rnhBhA1J8gGew5yNs4CpwHiLFzV11Qgak/gCp/SnKgLPBwnlryIDXCMeQAu7fQc8Aby54R7PXgx5o8j0D7Cu4NTTd8Rt00ANNV89AKbo1kJBcevQR8htMbGbASv73jBjoug9aG/ZHDOQ50qHDm59Ju0hz3sq6Z9gAQ6VjWFGEL3FZpf53o9SUNWyABoZJyi+bJKgKSZWnriYmwZIBtBAHxNIxlHt4QBxF1IDsqJp7LCMa7LzRKe9GSol8Gh1RAyONP+WWDZyf0ps8y197VgyYdt3RGlwEM2+F0DkmGGHFADqIAuIeyIOcn11+AQAA///8qqOlAAAABklEQVQDAHbJjkHCk/0iAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABv0lEQVR4AdyUC46EMAxD8d7/zmxeIBD6gfKRVtoRbuPETVxmND/TH3/+rYHZXmzAwv7z5RuIgex5IjyQ8x6/MRBNY/eGFwvag+SpgarRoWufqCw9MXB3OEMD5fzproG7wxnIGUBcoTSAEGQhPJDzd2N6VGdKAyFoiqP45V4ZmOd5AjZkMwEHlvMacQ89DfkWKgMhYoDFmwmLfbjE7wlWQ5Jr6ko/0zXAEUwA4gBcqk1I94fT89QAghZ6Jlraq9wjA1dNy7rkb8yXspYN2MWWr1w6aqUjL5u84dnAmz6Pz2KAa4OhJpImSa6Vlh1ir2/Lw0eBAbqA7QzNNmJB5sQZVn71YKBqIB38VPUvE00D3HB0iLSb5Zy0c3pIzn2Bl8gGZB+vswMnjeWsluWrrjscbTYAtzO73oj/sMqdmyIGxNSJ2eHEoygNcA4HAf9vp2kAwQgwYzr62NZ/Wgay2voce2DEklnjJsvcQXBCrgxw1HrvJoyQ274aJ+uCOcJVsx8i2cGIAY5aT/lQI0rwnBUttTw5XjLn66gBusRg4kDk2N3MWnC+xqfbHQOnjazI0IDRsedLA2MTC9X/N1BcuKK/AAAA//+mQkyJAAAABklEQVQDANjBpkE8aWwGAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABr0lEQVR4AeyU25LDIAxD4/3/f876eBBj2EBSwsy+tIOC8UVS0jY/xz9/vgbePoHTv8ERvHS/Vg1IdKZAj+rEPaK2YgCiGL65WKmP+iO/YkDEhf/PRh1QCBGCC0TPioELriaFqNAU/ICo4MfjWDEAeQzvuHxqYKs4NzAzgBigD0R8nuexAgiuIAOQg6YHIU+QByHs561LBkSOEKgimAA1sTmoBuBNQo0J1cyM8GOYxVxc+uHGAEWZ0E5OIGdmh5kpdbubRW9crpplwPxT6wjVQxdQA7m/a6nH0jMUp1EGiLcBYeCEU3GvL72ImBsiCd+KQ7L8BPgaIMhI4jk9jTHQ/OILSR26OpMDtelFgAEeVWNixIcody7kPmp+hsu35wsDdD8aRJhmoYjquLTLQB3uRfqzGhFXjdjzj27C+5rVGChE0xcNPWCHOE6ygbiDTE4D5wyEgWq+x5zvSysbCALIs2Ak/UIeeBiLHg9eift88yKq/4QkhACgt2KXOITNE5DwTgFEZmgMzBpV220uG3Bu0z/AJKjdi8Oaelb2bIB5hAFxBjkh51/HvYHXhD3B3fkXAAD//2axBj8AAAAGSURBVAMAsHWpQYc0+ekAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB0klEQVR4AeySUXKEMAxDofe/M9UzKDWMA5u0O/3ZTtTYsi0Llq/ln/8+Bv7qDWz6JQ2Fr5/fGqiWVlzX0ayBV5a80rPMGEC4+0RF4bZ/1MCtWLH8kcoGEAe9obtab8Z8dzYbeGx2w+RdmjgZ2LZtAVpAM1AYR/ReUxA9M7eUsqbS5fQRrvoL0uJKGAAK6+OZurqz7kFXzEnv9AZUPB0GDIvkBjjqmbvG9GTu6G8mbg0Ug5kaieVjbf3ZRDYgvhlrzb1AivEt9OoFr5EfE67bQFuuLtf+5JYwOn4yye8mzNsATW+Dlx0LmgnyRwPqXgwGDEThnd/dR9/+6HujqD3FgF9PlBAmUEcsJoYDxKNARzP7NgXpwK0YKD8mFhppqIUIU+cGrTAYYEDzmBmb9HJuJiUSb4ybHOSYvAIG4NVbm1AhhGm6guXUuY1rz1NuA/RJa41lCtqtwirknLSBxbmfnCIcMVB++s6Ut5MNQLLsCvPxrSAMIA2WAOe+r33m8301kGvXWHprmGCZkvZWHHuAXHE8yBErrc+IARSkh+4SRiAECCNMicun1TLpeNQAc2FC/4h7YGmvduJnDCDAAoPcqDjXynvWQCk2Q34MvP0NPP0s3wAAAP//pZAaygAAAAZJREFUAwCPYdhBAndSBQAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABrUlEQVR4AeyWgW7DIBBDYf//z5nfNUcIXChpmSZVrXAAn8+4LKr2k/758w1wdQPbH/9l8DdcBeB8BMyrcfIdBeDgkxjiTXR+zwJwXtcE+QIinzwTgLOiZvhZRP2Z5ihAJEYLD1jfQdRjh2PSBojE6GrMaNCjA6xrlMMh6wCbPglQYI5ATYiMRSd4w6AXXUEdoJCjBcZBvTs00ITU7QC47CE4dN9u5eYgrtD0mcwDqOZ+acrMuk169O3crckDdE0555TzgVagxHeCtu1lfxnAD/C5dCxeeICsz2LrOTsPgFoZjivXBm45uFGZlhenDiA+ZT0KCFFDteFAOxQExTZAJyGxoys2BDpCgKZ02qITwS1sowAIpLs3MAeEcEQOaOCvAtjhLkIIRoZ1HR17+gH7GtQcUQD19L9sGKhgfawjqFjeH9au0doG/QDeCD3aAKrbl1fpMRADFRLzg7Xn6TAx7DWdBlyB99dedQDxx+GIgUj7xWMt62Km9StDNtm/SJbB6T+iUtRCtWQC1kAEe01vD3yAGdU3AEHBwR60e7hlaAMsM541+gb4/Bt49i78AgAA//81Tze0AAAABklEQVQDAHe6x0ENI7gCAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABbUlEQVR4AdyW7bKDIAxE2fv+7+zNwWZGEJAPy486roFA2AN22v6F9euwJVzWHLufAHzhVhxzzGa3ADDNpr/frQFsMWc7DoAhIueR9tflADIntNXcPIMD0EZAELcpB9hm7EZvA/AKXe7RjCWAt16DgxCrECWAOPk4jvCWbMEqRA1AdgVkxcs3G7FFihA1AJsfeBXGQKC7phpEC2DNsbN6K0DpFLYCcCg5RBeAfRCoTUQOJcmJTg/A7VOIMTtBE55JSQ9AUoB5kljsDAOs7jrfQC+A1d3exOLez/JegHP25WlEl15/Mz/BEQDzVLBH/I3AkjaxJMaQj13bn1z8ah4BoE7xIXVBsFtJEdrriOSJaBSAmpsk3XKeuJjFSVIMvoFjGkA6TwED5IaSkh1L8iFi0iExBYAhYgEkKZpKooto5CKPZFecbx1NAfgCHm0h7qsh/ZZ87u1fcavIx7w4jz4+FKdOYMjhYfLvAzwcQPgHAAD//0lb3HwAAAAGSURBVAMAHlmRQQxIlKAAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABl0lEQVR4AdSUC7KDIAxFuW//e/blpMQKViUyTqcdLwTI5xA7/pUv/34CYLEmncmO7z9XHaDwVfYRn8McZwCZxPj2Oiy6PTgCINnW7zG7B6Aw0mTF4fgegEA0WX88PAC49VbjGfaeqQsEQJ8GmH7vkXUDsCxLCUW1WF/N+ONjcwo+ALxtkk+WozgIhqQiCXNIWYgAILlXkXxi7RAkRL5xMEhy3ziu/ttOYIfCzectABteXfKJ9U7S60x6z7Vg41v3vCg2ahzqogdgm8yyH/ZOkaifd462ET5mHj6fAMLZGJR6/xEYsyVYXw227cvUPGcAOBJgsUwsp8UraZJcAYRzGsICmtsfvY5RAEAs53gnPhWse3QBkbNkAAhIQRCAamFM70pdO0QWwJNcDUZ55bKePwLADUchHgHgeqMQdwDscuN/RnP2bwkzYCEAzV7uAFhc6oHW1UOQ5S6A5SInKVLaxd0FoKons2FtMTYHGc0AUIc2NBqAMBdCCC/pD9Eran5cIWY7MIMiC9Y3Aax+eeQVeHttoIAYzvQPAAD//71B8P0AAAAGSURBVAMAg7adP/rUKXMAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABuklEQVR4AdSUC5LDIAxD0d7/zlk/J7BA3JhJ2pltpwpGyELQz09Ze22HbB4PulSeOTWgTrEaIDU6BP3GfX0sn4csACbg3Fn81KyBaH2JywLIXIANvmE/UveIgkRc31OyAIP4E5OvCJBe45Ob+YobeHLAtDe7gXdc/6VHFsBPsG1buQNvLqX+jEv0ygJ4s6QiqfVLfzWkdJ5LzvkDzStkAbyP01NI8iB1DgeYS/uaJL8t+BUsBZB2UzYCkTF8Rbd++fmjWwkghJL89JKYhpA0axQKO3IlgMvr6RidCB6sVQTLIbUSwDzTmzyZWxNc2pgFMJ/Ug41CWDP8pUEWAIOP4l8G4MrAu0+OJxh85xuwj61pvJDSX9Jg2E+k1uu+9mDZfSnAHADO/8kQAwipGTFdgrT34AFeNc0BZK9BSzMYyIUJPaCXHt57smNhDgBtOs3/aPCNM4HXTtqjzutoVHtXjtFIGYZ3FAABQgeNFbbg3DHaMLzbWtUzmqLxVp/erwL0wsjAbnf4LvV66qgH/oSVAHPTsHl3ylm3NL8ToBk/3RyjOwFsX9UvoTB5gjsB2I+NAfUj3A2wvGkm/AUAAP//Djj8HQAAAAZJREFUAwBXU7NBQHFA4QAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABp0lEQVR4AdyVC27DMAxD093/zpmeaga2a0tuPsCwIoz+NKOs3c+29tmtDZjxq/ZJKO4ttRArAkQKUe0TX8aKgNkhiBFGPVHt6D8jAOKDoHKUl31ZDZiZX2cEzNlOVJ4UoE2Esp4UEB6s4r8XkL6GbAMpgVYZ2JAjE7Dt+34aRVT4VcwEvOyzCYXQY/lY6liBGFgcHm71LRNAj28AB1LAVogFYvICsWqZXRIAMaTCiFQ1bFUP3z99KwJ8jYgQGBxBdWyp+2zxh2ZFgA/yZIInBjfVsYPyMLUiwPjSTX6Q2xC5dDATYDwpBwcNYcPkQ4JMAASP4k8KYGXg7ieHEzS8/QbstR097lRfqWZwJahmnddujDkvDugFkPNfPpoBiYqIcAmagQPMhnoBNtf+djAMZgSzPDOgrhs5YXNAL8AbaBRICMrJZnnq6sVa3Bxu8fSfEY0OBgUb8FyxZprrqKkfax1H3vyPa7SBvikkoLmsuv7jSmeYAysC6BvBHpBz3qWBiHchuV8RAHUjgsS3uCqA81yE3dzn9g3uEMB5vAuA/xXuEjA9NCv8AgAA//+PzUghAAAABklEQVQDACmWtkEhgjegAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABkUlEQVR4AexU0ZKEIAwz9///7CVdy1ALCKu+7Q6B0pYk4M39be//dkoIXPJ420BX2K28aeBSXCbeMjAjrp79aQNGqps1UNcUW8uTBgqpMfen0PeUgUDa186Vpwxk5snMz8BjL7Dv+zaCf5G6R7lvDOgPLkCkAMSXAGADUMydG1YMmKjEzhCpclrPUF445wFYatYAOT5PbKduTADsRUgBYpsxYOJqbgGAE7bKJQeEPhwFXBkYiouEDfZ9AedUNgIItbAZGSC3Pnsk6+3YfPUSEhYCxchAaJzZTJhIND0D5Jq/fWI9EgD8VXCk0tIycFsZgAtLEJp6OBuwm3Pq9a/kJSwMz9QGqHvv8kDRK8FQnUU3EMQB1E/ItjyA2APAm0rgidEqA0n8OAD+jjAvPGRJ9Qi2+Ux6RscnM5hlgOdhN2agVnASuCgNTQYlargJrQ6va89YRrj0hwyoCk4OhmF4nv4Uhpr9F4yZtZ0bmD5FF/YavdWJVGecHTNZj1UDIlxBrdWMVw00Se4kfwZef4Grz/MPAAD//+S22nQAAAAGSURBVAMAXtKoQXS4tUYAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABs0lEQVR4AeySW7KDMAxD0d3/nrk6BmdIICW0MP0pE8WJH7Iw/E3PP7NbAJv9elpAt3FKeVLAaXNEPCVgqPkTAmgM4B7BfOcEzhoTB5WwuwTsiKsu9aXKvUtA3eL8VkR8S0CR+E0BMYXbBMzzPLXI12z93DP2jgCUV4BQUnIWix9ImiQVvxTn2K4IiKYQtoAZH/YIxMBRbFSA65cRH5H0fJLizaXFkicpDBsYERDNST6CpGhyFHNh+S+ISwrDljgTYA4mn+l764RoIgX5PmH1ZJ6vECYmBJSLg9vlGkJbV//s5O4ktlXkJfAjIN7Al/FuTj5aEEv7SUgKcVJtzaEQ4EMrwlwf6ylN4U+YOHuFqwjgRtD2487S8qbmYslbgaQQtvriH5Af35eFCLDcPtrlamBTLXwgnDkBayi+CLyzmSTLhslSAIWuV4zHh7A4e2hzuK+5Wu2Q2QqggOKCDSmxCvmZyAGbIP9QYuM+PrYC2ixzK6bhQxsrfzNiEiRxxhoIsemvMwFUylvglQjnvLVGBFTEiHgFkoljDYTb9NdVARBeQb/zGrkqYC27z/wEPD6Bs4/1DwAA///inEQIAAAABklEQVQDAAlPxkEs1+/XAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABw0lEQVR4AeyU4XKDMAyDYe//zkyfiSAEDIGW25/tojq2FUtJe/sZ8r9JLaDw3jozYNVXTfQYwMhrJnoNvGYCA3duBxdg6CvAQDsIAdDW6/yqX3NP962BO4PvcFMTtYGvDEyVkkZtIKG8W7aBP7k9V7OBYZqmHSCAsx79T2ADo/6WOeyBhZdG2binlJdroXL/soHNiUzYJPrsiS1UtyFtr1dtQBcb44Q2Q40odn7YkOgYUThftQGY0p1NeBCRRgsRw2Rbd17OXZqwAYgBDgIPOoqIwwFHfddKn7ku7WIYgGjsGE3B4k05TZmr5pEJahMGNHOM59RmE3Vws+iXgZv6g0Rj0B8GDMR5VeL/QCTlA0FQ0seB2To8Kw7IeLsakM4YtxdxbBB1EVT+eMnLKs605QWUWFjbzcrqG9JVImWuvtDKhcbawNJMNhiJ10j63WWLc+COAfg7EwwDNDPQryFezFFcf4QkJ+CLM4LmgSQ8L/EI8FRHsIZK8+p5Ac1Hez6gJL5LIhVH9gaihmoIKxyvHgPHJ1XNxNVC1FCarx4Dugyz5iFK4oeYxZnV/9ljgGk4uAPOdKHXQNewJ6R/A6+/wNXX8gsAAP//aYxDxgAAAAZJREFUAwBeMMZBJaD3oQAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABlklEQVR4AeyUW5KEMAhFw+x/z849TLDSmgfj46+tXEEgcExb/VPG16YUknlvzQBi6qsQGQBAXoMAgOaIQTNlamb7uzkAIhEDsCjirSWO2tgtvwWgUbZ5to6eUx0BpsWH5CMQdwAOPNcevwB+Atu2lVAcZDyPbNTdtQ7QNomBZlbMrE3tvpk5sAJ8iEcpnF8OYHYeFCC9VuSIY49SPIDkrpcDqMx0Dd9Y+fQKIG0ARGa+AIjXd5sFWdUBotFLCABUty+H4IkB2J7IMQD18hGr+SnEEYC9QCD8k2L4KTEIrCB6AINWxb+R2rA8dc0A9LLmQ+8Oq9Ddn2IGwFzzm9kjIOp1glgBaE8x3ZDM9cUpIHX4gMgAaM/fooHZPRZ6qNsO8R8A0+V/wVg18YWP/GFwI48i3UJkASBGJRphEU1rQ9yTao0fW/W9pu7ZMgCq9dn7RgX8JAjgY1sxKKS4D69WYfOXkKNQsQwAhV2NhqvYGsn9WB+5DIDp2jvgz7QXJp0MAK1a6ozPnpSyAKlmV4q+AK+fwOpn+QUAAP//z5ltdAAAAAZJREFUAwA6m61BwsCXGAAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABlklEQVR4AdSUCXLDIAxF/Xr/O6f6skUBY5bYbScexKLtP5hMvrZ//p4EeNldZLbMj6cAcuF8PyR5AmBJsCa6C9ASpxbpne8C1L2XxFX8DoBuHaYeuYVfa+6/3K8CTDc2xancFYCphiacj2HNLMCwUa5a7bu1MwAv+7Y7ZkCXECMA0y1rof9Dh37cYIoxAiiSAX8JaItAP140Ow49gPLqR4EWe5YNSgjYxRW/sGa/FoASTeNV3BaGAknXihMg7HXyWYL3tjWNGsDyduHIMEdsi1V+2F8BdpEi4Tgo79j6hY6zQNxdAzg5cFqPQi/KJyA/pr3ygVMfIOVoUwMo2jLlnkwiYafgj6PVTz7PqAHc+ZfTZwJAesHisaDtL5Kqw2e+QHWJ5hHmXmP2BbAvCemXH4crf8RH6yyA98nF3GFTDmNHH8pr+T1YTUsAVmu9SX8udk7DAsk/K67iVQDVyPAJkqjOZpgtjXcBQkSCYeFbWu8CNMVATM3QyfkrAKaCfbZsQ5IVgGEzKa7aCkD0DpBYr/wej+DV+g0AAP//bqgmqgAAAAZJREFUAwAWoqRB0lziyAAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABkElEQVR4AdSTi3KEIAxFPf3/f97monEhoBDbaWcdY8iD3APtfm3//PwE4GXsMnPP36cAtXC9TpNkASQmi0KjXOwZxlkAbIrMXPc+gsgCuOoVhNeXfRZAp3QbiXhNflTvchmA5aGHylL/KsDSsEO4dtN9KwDTIbXiYH27fwbwsmf7qRnUJcQMwPa2L9z/AOC+3k7bthQAUG4DiHNKDPf10hQ+dwCX16Y/CbQQsIuH+XU4nDcCUKNpvJrTwlTgFLPNG+yAsO9TzhrKbPPnGwGsbxf2Dkv4svHKQyvSNByB+o5lOdARC6SkI0AhBzp/bCyb6g9Qh+da/UA3Bzh7tIgAqo5MvZ1JxK0rvhOjecqVjghQkn/5+UwAOG+wuSwY55umEHzODUD+dOGww/DRDeg/36fBG2yQfxd9Q/DLABoO/Tzlw8zy24+5q3gZQAMkBhQBQKnTgDrPWZgsUgDVrCIA1KIqo0/GngK4hgTdPJfyKQCQVmr+tHkVAHs07NcJVgEknrUl2AyAD4zewYZ5L175bwAAAP//va/63gAAAAZJREFUAwBJ0aVBDp4adAAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABuklEQVR4AdSVgZKDIAxE5f7/n719qVvRCoZynZt2WCBhkyxRpz/LP/++UsCqpgEt82OmA4gAUypmBLjwlIi/EICQt0W0BJDQoEAGo/zI2RIQh9vkxKybq7tkeZEkIyCI25RNnuUtLQFlKzizpES0BEThdV2XDCCfefgy6ArIJIBDcVZQyljzhgSU0k9eSomOISSLnoCi3yEPNz37apvzQ0DC6Am4DD8XsY2QGgrut0sExp0A5dzzyFgMgg18CDHsz6x3Asih/A8RLsDKgYEtkk2/B/Of4TPjwsUL0wHL6YcI43TUNDMdcHDRpobM46ATxvGkbY0IqLOozt5hbl0fjuzfEXAoTjE5/NwxhzAqQLX2m19VohtAZzwuLf2REUBF0M20FT13gjjQjL0TEDfWRILLRBQGGweeIdfjz0yOy1j5m3/HnEUCNkAGS3yGsakmn9mFDWpb+0sRdx1Q3D7qpLt3aIcIIwK7AmgtCObN1OLhB4RzAUM2QpqPIA4rsvivw4lZ4b4ylngpfQbPEDe+klQHHMSqwHgPvJcdibB7EM8DPgi7JQBCFiTKcuHBf6Il4En49ObjAu4u8AsAAP//nRFkqAAAAAZJREFUAwBRFNBBXh+8HAAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABrklEQVR4AeyVgW6EIBBEsf//z3YeMhzhXEDPtGlSw7gLzM6O4uW+0i9f/wb+zBvY9akAhWfH1TeACfCYi6sG3BgTwPPb8a4BN/zYxKcGMIIJQH4ZrQFEWlwVo5YaIiCfojWQ9n2vUCUiRl1vOX1eajLXueJwtAY2XZV8Il73nkxaA8u6rdHlooDYG5D2FlCPZRH8io+F8Z0jHDJ6A5DV49yENpab+wglODRxZkA184EZMGNiRJzQRGgAcUMCeRSxxDo5yBuTW+GdmggNUGT0+qz3azbFOjmxRal5MxEaQMRAiJw4Q2k0o9X9yED9Ci3oSCVmALnBPmvAaysxMkAtJqS35TNXUiPNAKQWXnNs96J8ZMA1mxJj+jOkOWZVszRWDPDhgCXBq6SZAT3Q8Qcl4VMTq08b8UYGcnM1zkOTHCOhvKnbZJ+jFOs1RgZerJLZRJmGoecVU2/NERgaoBBAvANqQanlCHukyADE/MX3T1PEcrC4Y17UjTlQWjXQ6aH9PTKgvVR/94gZSVebMxUql7yFuWdRvC0ywHmtQjppldvzwiNA9EcQvYHHms+EvgEAAP//sjlAhQAAAAZJREFUAwDQ7NFBqTZ+awAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABsUlEQVR4AexVi26EMAyr9///zOy27hVoIGOnTZOGalISxzEP3X2UXz7+DfzZJ7C969N58gQ83PFbXiIDWfEsLzS5MmBRx7C5F7K8Tt+HlYGZcRQ/Xpsb5V0P450BNWbFszxpDiwNbNtWZpAtcab2eSZWPNLza2ng2O5Bx/w7rlcGwOORtoyyUU+LIbdWBnKdZD01ytaxHhnQYKHf8RB7svmyAQ9eDVeNJkCkV2hAYsasNg9e1cnVN7ACS+cVGtAg49jmwVHd+TlSQ6YY9is04CGKanHUXsKKys1QzjXtZ/T8yURkYLzH3lh/cCyood6rPsP5bIwMqF8mOAuFpx08sJIAhQFgfz0KwebKgFukaOyehI0AGAaVA+De25gxoPcmhGIaaoSkoHBngLrtD4j9SxNA/m6pcVpXBupwd/CiboHrgcC6DtR8PVWhfroy0CmvYBOvzHqX5an70gCA+nGJ+ARA6wfgdr3GGSUyIFL94q/uBmjCQIueAmAYV38E8rfIAGuligBNDGix8ABee10Sg6v9DKBxgXMkD5EBqJgEaeUr/JkbvgKJ/giiJ/C24XdCnwAAAP//x2EHGAAAAAZJREFUAwABjN5B+JF3eAAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABk0lEQVR4AeyVC3LDIAxErd7/zu4+glyD+Qimn+lMMlmDxGq1YMf5OP748zawcwLn5K7N1ovyVQMu7mMhpsDzPio1/q4auKvVTer4zu3OVwysNgjxVwy0duFNfGxxhrmogVGD3bVkLGogkX/iEjZwnufhwIjP72OdJ54hbGAmtLv+Pw1w7K0d9/ItrueWTsDMDrMXXMDMfHqtmX3lrsXOJGrA9LkewvtO6zkxgK+eUydRA9Jig1M9eBAZQ+QVA0mUnTlIODzHqFyouXjHqgFqEAfMa5AHdb4b7xhATLe5fAMrkfJcVrBjQL3K5t5QC0zbi6w0sGpAPcb6ItBmTIKRETGAGMglSwN1oFs0M6ANvf6EpNAUyk+9lh/faS0VIwNJABJQwOC/8TRvXdyQ8+HkeXMDIwPUFshCRa4VRHnUDg2wGwBxF9SDXM8p3NF9EUG63v25+DG4sI8PghKcBtD00iMGyp2hE6CBQ0XpOSBmLqQ3HzFQfK0TO1p55axnANEopHNEuTWvewsQ/RX0TuDbms+EPgEAAP//OpcvmAAAAAZJREFUAwBcnalBvGyGcQAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABtElEQVR4AeyUV3LDMAxEubl4cnMFDxHGpMwCKu3HGq3QF6tiv5V/Pl4C7jyBY/HWVvVmfFdAkIdtyCyIfFhLzc9dATXbdck1rnuH/o6A3QWp/h0BvbuIJWF7PdNcVsBswd2aC8sK8ObfuKQFHMdRaiCG+GrJBaitkBYQRJLcZYn05ZMgxkqPHPEKaQGSiiR/CpBKKh+lFCCpxIEQSd4buZlNC4AYzMiiRh+IeGbTAmYk36llBciOpz3vlgFmns6zX0+FSyIrgDHjfPDxiIkAPg0Ba8SlhJ1iRwBExi3/wMzxDzKWEwesUYbUuSsAUsgB/hXkwTU/jO8IgMxuvP0HtoTnuezgjgDb1S6PhVbA7RepdLArwHbM+a2BNfMmOk5kBEAGzpEtwxwYDq0E2A0d/rUbQ5eIL99qvXM5y9BMgBPQBCzA+E/QncElBEU/baffvYGZAGYbnERNrhdk+5idCuBuAI13wTw453kKNcpIAE3+7md3E8RhzyWNYR6QxNaw3DESYLXi7xvyGsWOiM3l9H++Ohd+bb1Rajgtp5EAUUzC2spOf907fAWQ/glGT+DHlq+IPgEAAP//eJoKCQAAAAZJREFUAwAmbLFBjvNHNwAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABXElEQVR4AeyV23LDIAxE2f7/P7s6qOJmGzuOO3mIGRaEtGjXdDr5SR8ej4HnBZ4XeF7geYGveIFl9nPz3y+w2EB/18QdBvaam/ZeCU+Odw2EyKgUeVeZrO8YGEUwEdiSpLbKv2qAJhmmXppFPO6FYMFfjbt2qvOsAS5ajyXZUm83EXlJTaaGUWO3LL1s83nGgN2rwpKmJozsnYeVvLQ2eMbA0Ore45EBM9692F3qpenMwK3ikj+/Ne0+YmagI8aBBpI3k5QkRWlzl5Q53NsivGygbUJTILmIpLZchOF0BT/kP8MlAzSUqhjngNTnXSsVM1L/X3TJQLKBoFTFLJUneQLJa5I6cWotZgZko+WuYsTgbAEyeTiAmBwxe2BmAI7d8y+wIH9J7BQBDVuQ2wM8avRgB0cG4MiWEZ0ZGgaMywx+4eWklM/EBhnSGQPwRnB5huAfcq4aCIHD/YjwCwAA//8v5MKGAAAABklEQVQDABx7rEH3YIYbAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABaklEQVR4AeyVgW7CMAxE+/b//8z80jpNCqSlME1CRVydnM/21ULbz/TPn8vAtYFrA9cGrg18/QZu8a9GRHj8/csN3OLzeGrDvmvg2ds945vR8/EdAzkk49xxeebbL/GhRumrBmyUmJbm9kkuo9wW5rbcdNSAxTHvVofGpTRrY3suyeax5OzTsNMhA1G7Du6ql0sIJqDA80LXIAek+c7E3gaittMPh4S4Dt0ezAFb+tAG7oo+Sext4JOz2l51rSMDsbWqa4tfPsO6+mja1Y8MdMK82ADmhkD5TQCZvotQf3x3OYmXDViU0EwCKGYyZ4Th8LLeUwYcCjijQk7AyntPAcxmYI7JnzJgsc1hHSYn5I0w54CyGXnAVIeRAeLTibeXbKpuC7VyaoRnOc/GxMiAmqijvEEcumhS2LCF3DOoM2cvo9gzoIZ4bNGZsWEitH5TX3WFhHL3HCBw+i+hxSPYW+xqjmzARqexV/gLAAD//yr9/LUAAAAGSURBVAMAGhKsQZUNKWgAAAAASUVORK5CYII=",
   ];

   // Animation states (matching original Neko.h enum)
   const NekoState = {
      STOP: 0,
      WASH: 1,
      SCRATCH: 2,
      YAWN: 3,
      SLEEP: 4,
      AWAKE: 5,
      U_MOVE: 6, // Up
      D_MOVE: 7, // Down
      L_MOVE: 8, // Left
      R_MOVE: 9, // Right
      UL_MOVE: 10, // Up-Left
      UR_MOVE: 11, // Up-Right
      DL_MOVE: 12, // Down-Left
      DR_MOVE: 13, // Down-Right
      U_CLAW: 14, // Clawing upward (at top boundary)
      D_CLAW: 15, // Clawing downward (at bottom boundary)
      L_CLAW: 16, // Clawing left (at left boundary)
      R_CLAW: 17, // Clawing right (at right boundary)
   };

   // Behavior modes (matching original Action enum)
   const BehaviorMode = {
      CHASE_MOUSE: 0,
      RUN_AWAY_FROM_MOUSE: 1,
      RUN_AROUND_RANDOMLY: 2,
      PACE_AROUND_SCREEN: 3,
      RUN_AROUND: 4,
   };

   // Animation timing constants (in frames)
   const STOP_TIME = 4;
   const WASH_TIME = 10;
   const SCRATCH_TIME = 4;
   const YAWN_TIME = 3;
   const AWAKE_TIME = 3;
   const CLAW_TIME = 10;

   // Sprite size
   const SPRITE_SIZE = 32;

   class Neko {
      constructor(options = {}) {
         // Configuration
         this.fps = options.fps || 120; // Target FPS (default 120 for smooth movement)
         // Original used 16 pixels/tick for 640x480 screens (~2.5% of width)
         // Modern screens are ~3x larger, so default to 24 for similar feel
         this.speed = options.speed || 24;
         this.behaviorMode = options.behaviorMode || BehaviorMode.CHASE_MOUSE;
         this.idleThreshold = options.idleThreshold || 6; // Original m_dwIdleSpace = 6

         // State
         this.state = NekoState.STOP;
         this.tickCount = 0; // Increments every frame (like m_uTickCount)
         this.stateCount = 0; // Increments every 2 original ticks (like m_uStateCount)

         // Position (display position for smooth rendering)
         this.x = options.startX || 0;
         this.y = options.startY || 0;
         // Logic position (updated at original 5 FPS tick rate)
         this.logicX = this.x;
         this.logicY = this.y;
         // Previous logic position (for interpolation)
         this.prevLogicX = this.x;
         this.prevLogicY = this.y;
         // Target tracking
         this.targetX = this.x;
         this.targetY = this.y;
         this.oldTargetX = this.x;
         this.oldTargetY = this.y;
         // Movement deltas (preserved like m_nDX, m_nDY in original)
         this.moveDX = 0;
         this.moveDY = 0;

         // Bounds - clientWidth excludes scrollbar, innerHeight is viewport height
         this.boundsWidth = document.documentElement.clientWidth - SPRITE_SIZE;
         this.boundsHeight = window.innerHeight - SPRITE_SIZE;

         // Mouse tracking - null until first mouse event
         // This prevents neko from running somewhere before user moves mouse
         this.mouseX = null;
         this.mouseY = null;
         this.hasMouseMoved = false;

         // DOM element
         this.element = null;
         this.spriteImages = [];
         this.allowBehaviorChange = options.allowBehaviorChange !== false; // Default true

         // Animation lookup table (maps state to sprite indices)
         // Format: [frame1_index, frame2_index]
         // These MUST match the original C++ m_nAnimation table EXACTLY
         // From Neko.cpp lines 40-57:
         this.animationTable = [
            [28, 28], // STOP: m_nAnimation[STOP][0]=28, [1]=28
            [25, 28], // WASH: m_nAnimation[WASH][0]=25, [1]=28
            [26, 27], // SCRATCH: m_nAnimation[SCRATCH][0]=26, [1]=27
            [29, 29], // YAWN: m_nAnimation[YAWN][0]=29, [1]=29
            [30, 31], // SLEEP: m_nAnimation[SLEEP][0]=30, [1]=31
            [0, 0], // AWAKE: m_nAnimation[AWAKE][0]=0, [1]=0
            [1, 2], // U_MOVE: m_nAnimation[U_MOVE][0]=1, [1]=2
            [9, 10], // D_MOVE: m_nAnimation[D_MOVE][0]=9, [1]=10
            [13, 14], // L_MOVE: m_nAnimation[L_MOVE][0]=13, [1]=14
            [5, 6], // R_MOVE: m_nAnimation[R_MOVE][0]=5, [1]=6
            [15, 16], // UL_MOVE: m_nAnimation[UL_MOVE][0]=15, [1]=16
            [3, 4], // UR_MOVE: m_nAnimation[UR_MOVE][0]=3, [1]=4
            [11, 12], // DL_MOVE: m_nAnimation[DL_MOVE][0]=11, [1]=12
            [7, 8], // DR_MOVE: m_nAnimation[DR_MOVE][0]=7, [1]=8
            [17, 18], // U_CLAW: m_nAnimation[U_CLAW][0]=17, [1]=18
            [23, 24], // D_CLAW: m_nAnimation[D_CLAW][0]=23, [1]=24
            [21, 22], // L_CLAW: m_nAnimation[L_CLAW][0]=21, [1]=22
            [19, 20], // R_CLAW: m_nAnimation[R_CLAW][0]=19, [1]=20
         ];

         // Additional state for behaviors
         this.cornerIndex = 0;
         this.ballX = 0;
         this.ballY = 0;
         this.ballVX = 0;
         this.ballVY = 0;

         this.init();
      }

      init() {
         // Create the neko element with defensive styles to prevent global CSS interference
         this.element = document.createElement("div");
         this.element.className = "neko";
         this.element.style.cssText = `
        position: fixed;
        width: ${SPRITE_SIZE}px;
        height: ${SPRITE_SIZE}px;
        image-rendering: pixelated;
        pointer-events: ${this.allowBehaviorChange ? "auto" : "none"};
        cursor: ${this.allowBehaviorChange ? "pointer" : "default"};
        z-index: 999999;
        left: ${this.x}px;
        top: ${this.y}px;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        overflow: visible;
        box-sizing: border-box;
        user-select: none;
        -webkit-user-select: none;
      `;

         // Create image element with defensive styles to prevent global CSS interference
         const img = document.createElement("img");
         img.style.cssText = `
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        margin: 0;
        padding: 0;
        max-width: none;
        max-height: none;
        display: block;
        box-sizing: border-box;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
        pointer-events: none;
      `;
         this.element.appendChild(img);

         document.body.appendChild(this.element);

         // Click to cycle through behaviors
         // Use mousedown instead of click - click requires mouseup on same element,
         // which fails if the cat moves between mousedown and mouseup
         if (this.allowBehaviorChange) {
            this.element.addEventListener("mousedown", (e) => {
               e.stopPropagation();
               e.preventDefault(); // Prevent text selection
               // Make cat appear surprised/awake
               this.setState(NekoState.AWAKE);
               this.cycleBehavior();
            });
         }

         // Track mouse position - set flag on first move
         document.addEventListener("mousemove", (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.hasMouseMoved = true;
         });

         // Update bounds on resize
         window.addEventListener("resize", () => {
            this.boundsWidth =
               document.documentElement.clientWidth - SPRITE_SIZE;
            this.boundsHeight = window.innerHeight - SPRITE_SIZE;
         });

         // Random starting position within viewport
         this.x = Math.random() * this.boundsWidth;
         this.y = Math.random() * this.boundsHeight;
         this.logicX = this.x;
         this.logicY = this.y;
         this.prevLogicX = this.x;
         this.prevLogicY = this.y;
         // Initialize target to current position (so no initial movement)
         this.targetX = this.x + SPRITE_SIZE / 2;
         this.targetY = this.y + SPRITE_SIZE - 1;
         this.oldTargetX = this.targetX;
         this.oldTargetY = this.targetY;
         this.updatePosition();

         // Animation loop
         this.running = false;
         this.intervalId = null;
      }

      start() {
         if (this.running) return;
         this.running = true;

         // Calculate interval from FPS
         // Higher FPS = smoother movement while maintaining same speed
         const interval = 1000 / this.fps;
         this.intervalId = setInterval(() => {
            this.update();
         }, interval);
      }

      stop() {
         this.running = false;
         if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
         }
      }

      setSprites(sprites) {
         this.spriteImages = sprites;
         this.updateSprite();
      }

      updateSprite() {
         if (this.spriteImages.length === 0) return;

         // Get the current animation frame index
         // Uses tickCount which is scaled to match original 5 FPS timing
         let frameIndex;
         if (this.state === NekoState.SLEEP) {
            // Slower animation for sleep (toggles every 4 ticks in original = 800ms)
            frameIndex =
               this.animationTable[this.state][(this.tickCount >> 2) & 0x1];
         } else {
            // Normal animation speed (toggles every tick in original = 200ms)
            frameIndex = this.animationTable[this.state][this.tickCount & 0x1];
         }

         // Update the image
         const img = this.element.querySelector("img");
         if (img && this.spriteImages[frameIndex]) {
            img.src = this.spriteImages[frameIndex];
         }
      }

      updatePosition() {
         this.element.style.left = Math.round(this.x) + "px";
         this.element.style.top = Math.round(this.y) + "px";
      }

      update() {
         // Track time accumulator for original tick timing
         // Original runs at 5 FPS (200ms per tick), we run at this.fps
         // We need to accumulate fractional ticks and process when we hit a full tick
         if (this.tickAccumulator === undefined) this.tickAccumulator = 0;

         const originalFPS = 5;
         this.tickAccumulator += originalFPS / this.fps;

         // Process as many original ticks as have accumulated
         while (this.tickAccumulator >= 1) {
            this.tickAccumulator -= 1;
            // Save previous position before processing tick
            this.prevLogicX = this.logicX;
            this.prevLogicY = this.logicY;
            this.processOriginalTick();
         }

         // Smooth interpolation between logic positions
         // tickAccumulator represents progress (0-1) towards next tick
         const t = this.tickAccumulator;
         this.x = this.prevLogicX + (this.logicX - this.prevLogicX) * t;
         this.y = this.prevLogicY + (this.logicY - this.prevLogicY) * t;

         // Update display position every frame
         this.updatePosition();
      }

      processOriginalTick() {
         // This runs at the original 5 FPS equivalent timing
         // Increment tick counter (like m_uTickCount)
         this.tickCount++;
         if (this.tickCount >= 9999) this.tickCount = 0;

         // Increment state counter every 2 ticks (like original)
         if (this.tickCount % 2 === 0) {
            this.stateCount++;
         }

         // Update behavior based on mode
         switch (this.behaviorMode) {
            case BehaviorMode.CHASE_MOUSE:
               this.chaseMouse();
               break;
            case BehaviorMode.RUN_AWAY_FROM_MOUSE:
               this.runAwayFromMouse();
               break;
            case BehaviorMode.RUN_AROUND_RANDOMLY:
               this.runRandomly();
               break;
            case BehaviorMode.PACE_AROUND_SCREEN:
               this.paceAroundScreen();
               break;
            case BehaviorMode.RUN_AROUND:
               this.runAround();
               break;
         }

         // Update animation frame
         this.updateSprite();
      }

      chaseMouse() {
         // Don't chase until mouse has moved at least once
         if (!this.hasMouseMoved) {
            // Just idle in place - pass target that results in zero movement
            this.runTowards(
               this.logicX + SPRITE_SIZE / 2,
               this.logicY + SPRITE_SIZE - 1,
            );
            return;
         }
         this.runTowards(this.mouseX, this.mouseY);
      }

      runAwayFromMouse() {
         // Don't run away until mouse has moved
         if (!this.hasMouseMoved) {
            this.runTowards(
               this.logicX + SPRITE_SIZE / 2,
               this.logicY + SPRITE_SIZE - 1,
            );
            return;
         }

         // Original uses m_dwIdleSpace * 16 as the trigger distance
         const dwLimit = this.idleThreshold * 16;
         const xdiff = this.logicX + SPRITE_SIZE / 2 - this.mouseX;
         const ydiff = this.logicY + SPRITE_SIZE / 2 - this.mouseY;

         if (Math.abs(xdiff) < dwLimit && Math.abs(ydiff) < dwLimit) {
            // Mouse cursor is too close - run away
            const dLength = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
            let targetX, targetY;
            if (dLength !== 0) {
               targetX = this.logicX + (xdiff / dLength) * dwLimit;
               targetY = this.logicY + (ydiff / dLength) * dwLimit;
            } else {
               targetX = targetY = 32;
            }
            this.runTowards(targetX, targetY);
            // Skip awake animation like original
            if (this.state === NekoState.AWAKE) {
               this.calcDirection(targetX - this.logicX, targetY - this.logicY);
            }
         } else {
            // Keep running to current target (idle in place)
            this.runTowards(this.targetX, this.targetY);
         }
      }

      runRandomly() {
         // Original: increments actionCount while sleeping, picks new target after idleSpace*10
         if (this.state === NekoState.SLEEP) {
            this.actionCount = (this.actionCount || 0) + 1;
         }
         if ((this.actionCount || 0) > this.idleThreshold * 10) {
            this.actionCount = 0;
            this.targetX = Math.random() * this.boundsWidth;
            this.targetY = Math.random() * this.boundsHeight;
            this.runTowards(this.targetX, this.targetY);
         } else {
            this.runTowards(this.targetX, this.targetY);
         }
      }

      paceAroundScreen() {
         // Original checks if neko has stopped moving (m_nDX == 0 && m_nDY == 0)
         // We track this via lastMoveDX/DY
         if (this.lastMoveDX === 0 && this.lastMoveDY === 0) {
            this.cornerIndex = ((this.cornerIndex || 0) + 1) % 4;
         }

         // Corners offset by sprite size (matching original)
         // Target positions that result in neko stopping at the corners
         const corners = [
            [SPRITE_SIZE + SPRITE_SIZE / 2, SPRITE_SIZE + SPRITE_SIZE - 1],
            [
               SPRITE_SIZE + SPRITE_SIZE / 2,
               this.boundsHeight - SPRITE_SIZE + SPRITE_SIZE - 1,
            ],
            [
               this.boundsWidth - SPRITE_SIZE + SPRITE_SIZE / 2,
               this.boundsHeight - SPRITE_SIZE + SPRITE_SIZE - 1,
            ],
            [
               this.boundsWidth - SPRITE_SIZE + SPRITE_SIZE / 2,
               SPRITE_SIZE + SPRITE_SIZE - 1,
            ],
         ];

         const target = corners[this.cornerIndex || 0];
         this.runTowards(target[0], target[1]);
      }

      runAround() {
         // Original ball physics with repelling from edges
         const dwBoundingBox = this.speed * 8;

         // Initialize ball if needed (matching original constructor)
         if (this.ballX === 0 && this.ballY === 0) {
            this.ballX = Math.random() * (this.boundsWidth - dwBoundingBox);
            this.ballY = Math.random() * (this.boundsHeight - dwBoundingBox);
            this.ballVX = (Math.random() < 0.5 ? 1 : -1) * (this.speed / 2) + 1;
            this.ballVY = (Math.random() < 0.5 ? 1 : -1) * (this.speed / 2) + 1;
         }

         // Move invisible ball
         this.ballX += this.ballVX;
         this.ballY += this.ballVY;

         // Repel from edges (original logic)
         if (this.ballX < dwBoundingBox) {
            if (this.ballX > 0) this.ballVX++;
            else this.ballVX = -this.ballVX;
         } else if (this.ballX > this.boundsWidth - dwBoundingBox) {
            if (this.ballX < this.boundsWidth) this.ballVX--;
            else this.ballVX = -this.ballVX;
         }

         if (this.ballY < dwBoundingBox) {
            if (this.ballY > 0) this.ballVY++;
            else this.ballVY = -this.ballVY;
         } else if (this.ballY > this.boundsHeight - dwBoundingBox) {
            if (this.ballY < this.boundsHeight) this.ballVY--;
            else this.ballVY = -this.ballVY;
         }

         this.runTowards(this.ballX, this.ballY);
      }

      setState(newState) {
         // Reset counters on state change (like original SetState)
         this.tickCount = 0;
         this.stateCount = 0;
         this.state = newState;
      }

      runTowards(targetX, targetY) {
         // Store old target for MoveStart check
         this.oldTargetX = this.targetX;
         this.oldTargetY = this.targetY;
         this.targetX = targetX;
         this.targetY = targetY;

         // Calculate distance to target (using logic position, not display position)
         const dx = targetX - this.logicX - SPRITE_SIZE / 2; // Stop in middle of cursor
         const dy = targetY - this.logicY - SPRITE_SIZE + 1; // Just above cursor
         const distance = Math.sqrt(dx * dx + dy * dy);

         // Calculate movement delta (like original m_nDX, m_nDY)
         // Store as instance variables so they persist across ticks
         // IMPORTANT: Use integers like original to prevent direction flickering
         // which causes state resets and prevents wall clawing
         if (distance !== 0) {
            if (distance <= this.speed) {
               // Less than top speed - jump the gap
               this.moveDX = Math.trunc(dx);
               this.moveDY = Math.trunc(dy);
            } else {
               // More than top speed - run at top speed
               this.moveDX = Math.trunc((this.speed * dx) / distance);
               this.moveDY = Math.trunc((this.speed * dy) / distance);
            }
         } else {
            this.moveDX = 0;
            this.moveDY = 0;
         }

         // Store for paceAroundScreen check
         this.lastMoveDX = this.moveDX;
         this.lastMoveDY = this.moveDY;

         // Check if target moved (MoveStart equivalent)
         const moveStart = !(
            this.oldTargetX >= this.targetX - this.idleThreshold &&
            this.oldTargetX <= this.targetX + this.idleThreshold &&
            this.oldTargetY >= this.targetY - this.idleThreshold &&
            this.oldTargetY <= this.targetY + this.idleThreshold
         );

         // State machine (matching original RunTowards switch)
         switch (this.state) {
            case NekoState.STOP:
               if (moveStart) {
                  this.setState(NekoState.AWAKE);
               } else if (this.stateCount >= STOP_TIME) {
                  // Check for wall scratching using preserved moveDX/moveDY
                  if (this.moveDX < 0 && this.logicX <= 0) {
                     this.setState(NekoState.L_CLAW);
                  } else if (
                     this.moveDX > 0 &&
                     this.logicX >= this.boundsWidth
                  ) {
                     this.setState(NekoState.R_CLAW);
                  } else if (this.moveDY < 0 && this.logicY <= 0) {
                     this.setState(NekoState.U_CLAW);
                  } else if (
                     this.moveDY > 0 &&
                     this.logicY >= this.boundsHeight
                  ) {
                     this.setState(NekoState.D_CLAW);
                  } else {
                     this.setState(NekoState.WASH);
                  }
               }
               break;

            case NekoState.WASH:
               if (moveStart) {
                  this.setState(NekoState.AWAKE);
               } else if (this.stateCount >= WASH_TIME) {
                  this.setState(NekoState.SCRATCH);
               }
               break;

            case NekoState.SCRATCH:
               if (moveStart) {
                  this.setState(NekoState.AWAKE);
               } else if (this.stateCount >= SCRATCH_TIME) {
                  this.setState(NekoState.YAWN);
               }
               break;

            case NekoState.YAWN:
               if (moveStart) {
                  this.setState(NekoState.AWAKE);
               } else if (this.stateCount >= YAWN_TIME) {
                  this.setState(NekoState.SLEEP);
               }
               break;

            case NekoState.SLEEP:
               if (moveStart) {
                  this.setState(NekoState.AWAKE);
               }
               break;

            case NekoState.AWAKE:
               if (
                  this.stateCount >=
                  AWAKE_TIME + Math.floor(Math.random() * 20)
               ) {
                  this.calcDirection(this.moveDX, this.moveDY);
               }
               break;

            case NekoState.U_MOVE:
            case NekoState.D_MOVE:
            case NekoState.L_MOVE:
            case NekoState.R_MOVE:
            case NekoState.UL_MOVE:
            case NekoState.UR_MOVE:
            case NekoState.DL_MOVE:
            case NekoState.DR_MOVE:
               // Calculate new position using preserved moveDX/moveDY
               let newX = this.logicX + this.moveDX;
               let newY = this.logicY + this.moveDY;
               const wasOutside =
                  newX <= 0 ||
                  newX >= this.boundsWidth ||
                  newY <= 0 ||
                  newY >= this.boundsHeight;

               // Update direction
               this.calcDirection(this.moveDX, this.moveDY);

               // Clamp position
               newX = Math.max(0, Math.min(this.boundsWidth, newX));
               newY = Math.max(0, Math.min(this.boundsHeight, newY));
               const notMoved = newX === this.logicX && newY === this.logicY;

               // Stop if we can't go further
               if (wasOutside && notMoved) {
                  this.setState(NekoState.STOP);
               } else {
                  this.logicX = newX;
                  this.logicY = newY;
               }
               break;

            case NekoState.U_CLAW:
            case NekoState.D_CLAW:
            case NekoState.L_CLAW:
            case NekoState.R_CLAW:
               if (moveStart) {
                  this.setState(NekoState.AWAKE);
               } else if (this.stateCount >= CLAW_TIME) {
                  this.setState(NekoState.SCRATCH);
               }
               break;

            default:
               this.setState(NekoState.STOP);
               break;
         }
      }

      calcDirection(dx, dy) {
         // Calculate direction based on movement delta (like original CalcDirection)
         let newState;

         if (dx === 0 && dy === 0) {
            newState = NekoState.STOP;
         } else {
            const largeX = dx;
            const largeY = -dy; // Y is inverted
            const length = Math.sqrt(largeX * largeX + largeY * largeY);
            const sinTheta = largeY / length;

            const sinPiPer8 = 0.3826834323651;
            const sinPiPer8Times3 = 0.9238795325113;

            if (dx > 0) {
               if (sinTheta > sinPiPer8Times3) {
                  newState = NekoState.U_MOVE;
               } else if (sinTheta > sinPiPer8) {
                  newState = NekoState.UR_MOVE;
               } else if (sinTheta > -sinPiPer8) {
                  newState = NekoState.R_MOVE;
               } else if (sinTheta > -sinPiPer8Times3) {
                  newState = NekoState.DR_MOVE;
               } else {
                  newState = NekoState.D_MOVE;
               }
            } else {
               if (sinTheta > sinPiPer8Times3) {
                  newState = NekoState.U_MOVE;
               } else if (sinTheta > sinPiPer8) {
                  newState = NekoState.UL_MOVE;
               } else if (sinTheta > -sinPiPer8) {
                  newState = NekoState.L_MOVE;
               } else if (sinTheta > -sinPiPer8Times3) {
                  newState = NekoState.DL_MOVE;
               } else {
                  newState = NekoState.D_MOVE;
               }
            }
         }

         if (this.state !== newState) {
            this.setState(newState);
         }
      }

      isIdle() {
         return (
            this.state === NekoState.STOP ||
            this.state === NekoState.WASH ||
            this.state === NekoState.SCRATCH ||
            this.state === NekoState.YAWN ||
            this.state === NekoState.SLEEP ||
            this.state === NekoState.AWAKE
         );
      }

      cycleBehavior() {
         // Cycle through behaviors: Chase -> Run Away -> Random -> Pace -> Run Around -> back to Chase
         const behaviors = [
            BehaviorMode.CHASE_MOUSE,
            BehaviorMode.RUN_AWAY_FROM_MOUSE,
            BehaviorMode.RUN_AROUND_RANDOMLY,
            BehaviorMode.PACE_AROUND_SCREEN,
            BehaviorMode.RUN_AROUND,
         ];
         const currentIndex = behaviors.indexOf(this.behaviorMode);
         const nextIndex = (currentIndex + 1) % behaviors.length;
         this.behaviorMode = behaviors[nextIndex];

         // Reset state to wake the cat up if sleeping
         if (this.state === NekoState.SLEEP) {
            this.setState(NekoState.AWAKE);
         }

         // Show behavior name (optional - can be removed if you don't want this)
         const behaviorNames = [
            "Chase Mouse",
            "Run Away From Mouse",
            "Run Around Randomly",
            "Pace Around Screen",
            "Run Around",
         ];
         console.log(`Neko behavior: ${behaviorNames[nextIndex]}`);
      }

      destroy() {
         if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
         }
      }
   }

   // Export to global scope
   window.Neko = Neko;
   window.NekoState = NekoState;
   window.BehaviorMode = BehaviorMode;

   // Auto-initialize function
   window.createNeko = function (options) {
      const neko = new Neko(options);
      neko.setSprites(NEKO_SPRITES);
      neko.start();
      return neko;
   };

   // Auto-start if script has data-autostart attribute
   if (
      document.currentScript &&
      document.currentScript.hasAttribute("data-autostart")
   ) {
      if (document.readyState === "loading") {
         document.addEventListener("DOMContentLoaded", function () {
            window.neko = createNeko();
         });
      } else {
         window.neko = createNeko();
      }
   }
})();
