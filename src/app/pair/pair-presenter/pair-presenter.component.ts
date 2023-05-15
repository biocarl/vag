import {Component, OnInit} from '@angular/core';
import {QueueService} from "../../queue.service";
import {PresenterView} from "../../presenter-view";
import {PresenterMessage} from "../../presenter-message";
import {QrCodeService} from "../../qr-code.service";
import {GroupService} from "../../group.service";
import {LoggerService} from "../../logger.service";
import {PairPresenterSubscribeResponse} from "../pair-presenter-subscribe-response";

/**
 * This interface defines the structure of the client message sent to the presenter for the "pair" interaction.
 * @interface
 */
interface CounterClientSubscribeResponse {
  participantName: string;
  interaction: string;
}

@Component({
  selector: 'app-counter-presenter',
  templateUrl: './pair-presenter.component.html',
  styleUrls: ['./pair-presenter.component.css']
})
/**
 * The pair presenter component is used to emit a pairing signal to all clients and
 * shows a QR code for quickly connecting with the appropriate channel
 * @component
 * @implements ClientView
 */
export class PairPresenterComponent implements OnInit, PresenterView {
  connectedParticipants: number = 0;
  qrCodeUrl ?: string;
  isPublic: boolean = false;

  constructor(private queueService: QueueService, private qrCodeService: QrCodeService, private groupService : GroupService) {}

  ngOnInit(): void {
    this.queueService.listenToClientChannel<CounterClientSubscribeResponse>(counterSubscriptionEvent => {
      if (counterSubscriptionEvent.interaction && counterSubscriptionEvent.interaction === "pair") {
        this.connectedParticipants++;
      }
      if (counterSubscriptionEvent.participantName) {
        this.log.toConsole(counterSubscriptionEvent.participantName + " is listening.")
      }
    });
  }

  initializeComponent(data: PresenterMessage): void {
    const presenterMessage = data as PairPresenterSubscribeResponse;
    if(presenterMessage.anonymity === "public"){
      this.isPublic = true;
    }

    let url = `https://shee.app/${this.groupService.getGroupName()}`;

    this.qrCodeService.generateQrCode(url).then(url => {
      this.qrCodeUrl = url;
    });
  }
}
