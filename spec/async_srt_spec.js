const { SRT, AsyncSRT } = require('../index.js');

describe("Async SRT Library", () => {
  it("exposes constants", () => {
    expect(SRT.ERROR).toEqual(-1);
    expect(SRT.INVALID_SOCK).toEqual(-1);
  });

  it("exposes socket options", () => {
    expect(SRT.SRTO_UDP_SNDBUF).toEqual(8);
    expect(SRT.SRTO_RCVLATENCY).toEqual(43);
  });

  it("can create an SRT socket", done => {
    const asyncSrt = new AsyncSRT();
    asyncSrt.createSocket(false, (socket) => {
      expect(socket).not.toEqual(SRT.ERROR);
      done();
    });
  });

  it("can create an SRT socket for sending data", done => {
    const asyncSrt = new AsyncSRT();
    asyncSrt.createSocket(true, (socket) => {
      expect(socket).not.toEqual(SRT.ERROR);
      done();
    });
  });

  it("can get socket state", done => {
    const asyncSrt = new AsyncSRT();
    asyncSrt.createSocket(false, (socket) => {
      asyncSrt.getSockState(socket, (state) => {
        expect(state).toEqual(SRT.SRTS_INIT);
        done();
      });
    });
  });

  it("can set SRT sockopt SRTO_MSS", done => {
    const asyncSrt = new AsyncSRT();
    asyncSrt.createSocket(false, (socket) => {
      asyncSrt.setSockOpt(socket, SRT.SRTO_MSS, 1052, (result) => {
        expect(result).not.toEqual(SRT.ERROR);
        asyncSrt.getSockOpt(socket, SRT.SRTO_MSS, (value) => {
          expect(value).toEqual(1052);
          done();
        });
      });
    });
  });

  it("can set SRT socket in non-blocking mode", done => {
    const asyncSrt = new AsyncSRT();
    asyncSrt.createSocket(false, (socket) => {
      asyncSrt.setSockOpt(socket, SRT.SRTO_RCVSYN, false, (result) => {
        expect(result).not.toEqual(SRT.ERROR);
        asyncSrt.getSockOpt(socket, SRT.SRTO_RCVSYN, (value) => {
          expect(value).toEqual(false);
          done();
        });
      });
    });
  });

  it("can setup non-blocking event poll", done => {
    const asyncSrt = new AsyncSRT();
    asyncSrt.createSocket(false, (socket) => {
      asyncSrt.setSockOpt(socket, SRT.SRTO_RCVSYN, false, () => {
        asyncSrt.bind(socket, "0.0.0.0", 1235, () => {
          asyncSrt.listen(socket, 10, () => {
            asyncSrt.epollCreate((epid) => {
              asyncSrt.epollAddUsock(epid, socket, SRT.EPOLL_IN | SRT.EPOLL_ERR, () => {
                asyncSrt.epollUWait(epid, 500, (events) => {
                  expect(events.length).toEqual(0);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
